import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const endpoint = this.config.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    const region = this.config.get<string>('S3_REGION', 'us-east-1');
    const accessKey = this.config.get<string>('S3_ACCESS_KEY', 'minioadmin');
    const secretKey = this.config.get<string>('S3_SECRET_KEY', 'minioadmin');
    const forcePath = this.config.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';

    this.s3 = new S3Client({
      endpoint,
      region,
      forcePathStyle: forcePath,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
    this.bucket = this.config.get<string>('S3_BUCKET', 'neo-support');
    this.publicBaseUrl = this.config.get<string>('S3_PUBLIC_BASE_URL', endpoint);
  }

  async upload(organizationId: string, file: Express.Multer.File) {
    if (!file) throw new NotFoundException('File missing');
    const key = `${organizationId}/${Date.now()}-${randomBytes(8).toString('hex')}-${this.safeName(file.originalname)}`;
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const url = `${this.publicBaseUrl}/${this.bucket}/${key}`;
    const attachment = await this.prisma.attachment.create({
      data: {
        organizationId,
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        url,
        key,
      },
    });
    return attachment;
  }

  async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: 600 });
  }

  async remove(organizationId: string, key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    await this.prisma.attachment.deleteMany({ where: { organizationId, key } });
    return { success: true };
  }

  private safeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}