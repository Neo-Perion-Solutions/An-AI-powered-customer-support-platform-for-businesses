import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
} from '@prisma/client';

interface RAGService {
  chunkText(text: string, opts?: { chunkSize?: number; overlap?: number }): Promise<string[]>;
  embed(texts: string[]): Promise<number[][]>;
  upsert(
    organizationId: string,
    sourceId: string,
    items: Array<{ content: string; embedding: number[]; metadata: Record<string, unknown> }>,
  ): Promise<void>;
  search(
    organizationId: string,
    query: string,
    options?: { topK?: number; threshold?: number },
  ): Promise<Array<{ content: string; sourceId: string; chunkIndex: number; score: number; metadata: Record<string, unknown> }>>;
  deleteBySource(organizationId: string, sourceId: string): Promise<void>;
}

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  private readonly rag: RAGService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.rag = this.buildRagClient();
  }

  private buildRagClient(): RAGService {
    const aiUrl = this.config.get<string>('AI_SERVICE_URL', 'http://localhost:4001');
    const self = this;
    return {
      async chunkText(text: string, opts?: any): Promise<string[]> {
        try {
          const res = await axios.post(`${aiUrl}/rag/chunk`, { text, ...opts });
          return res.data?.chunks ?? [text];
        } catch (err) {
          return self.fallbackChunk(text);
        }
      },
      async embed(texts: string[]): Promise<number[][]> {
        try {
          const res = await axios.post(`${aiUrl}/rag/embed`, { texts });
          return res.data?.embeddings ?? texts.map(() => []);
        } catch {
          return texts.map(() => []);
        }
      },
      async upsert(orgId: string, sourceId: string, items: any[]): Promise<void> {
        try {
          await axios.post(`${aiUrl}/rag/upsert`, { organizationId: orgId, sourceId, items });
        } catch (err) {
          self.logger.warn(`RAG upsert failed: ${(err as Error).message}`);
        }
      },
      async search(orgId: string, query: string, options?: any): Promise<any[]> {
        try {
          const res = await axios.post(`${aiUrl}/rag/search`, {
            organizationId: orgId,
            query,
            topK: options?.topK ?? 5,
            threshold: options?.threshold ?? 0.7,
          });
          return res.data?.results ?? [];
        } catch {
          return [];
        }
      },
      async deleteBySource(orgId: string, sourceId: string): Promise<void> {
        try {
          await axios.post(`${aiUrl}/rag/delete`, { organizationId: orgId, sourceId });
        } catch (err) {
          self.logger.warn(`RAG delete failed: ${(err as Error).message}`);
        }
      },
    };
  }

  async fallbackChunk(text: string): Promise<string[]> {
    const chunkSize = 800;
    const overlap = 80;
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks.length > 0 ? chunks : [text];
  }

  async list(organizationId: string, page?: number, pageSize?: number, status?: KnowledgeSourceStatus) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = { organizationId, ...(status ? { status } : {}) };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.knowledgeSource.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { chunks: true } } },
      }),
      this.prisma.knowledgeSource.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async get(organizationId: string, id: string) {
    const source = await this.prisma.knowledgeSource.findFirst({
      where: { id, organizationId },
      include: { chunks: { orderBy: { chunkIndex: 'asc' }, take: 50 } },
    });
    if (!source) throw new NotFoundException('Knowledge source not found');
    return source;
  }

  async uploadDocument(organizationId: string, dto: CreateKnowledgeSourceDto) {
    const source = await this.prisma.knowledgeSource.create({
      data: {
        organizationId,
        name: dto.name,
        type: dto.type,
        url: dto.url,
        fileKey: dto.fileKey,
        fileSize: dto.fileSize,
        contentType: dto.contentType,
        status: KnowledgeSourceStatus.PENDING,
      },
    });

    void this.processSource(organizationId, source.id, dto.content ?? null);
    return source;
  }

  async scrapeUrl(organizationId: string, name: string, url: string) {
    const source = await this.prisma.knowledgeSource.create({
      data: {
        organizationId,
        name,
        type: KnowledgeSourceType.URL,
        url,
        status: KnowledgeSourceStatus.PROCESSING,
      },
    });

    void this.processSource(organizationId, source.id, null, url);
    return source;
  }

  async getChunks(organizationId: string, sourceId: string, page?: number, pageSize?: number) {
    const source = await this.prisma.knowledgeSource.findFirst({ where: { id: sourceId, organizationId } });
    if (!source) throw new NotFoundException('Knowledge source not found');

    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.knowledgeChunk.findMany({
        where: { organizationId, sourceId },
        skip,
        take,
        orderBy: { chunkIndex: 'asc' },
      }),
      this.prisma.knowledgeChunk.count({ where: { organizationId, sourceId } }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async reprocess(organizationId: string, sourceId: string) {
    const source = await this.prisma.knowledgeSource.findFirst({ where: { id: sourceId, organizationId } });
    if (!source) throw new NotFoundException('Knowledge source not found');

    await this.prisma.knowledgeChunk.deleteMany({ where: { sourceId, organizationId } });
    await this.prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: KnowledgeSourceStatus.PENDING, errorMessage: null, chunkCount: 0 },
    });
    void this.processSource(organizationId, sourceId, null, source.url ?? undefined);
    return { success: true };
  }

  async remove(organizationId: string, sourceId: string) {
    const source = await this.prisma.knowledgeSource.findFirst({ where: { id: sourceId, organizationId } });
    if (!source) throw new NotFoundException('Knowledge source not found');
    await this.rag.deleteBySource(organizationId, sourceId);
    await this.prisma.knowledgeSource.delete({ where: { id: sourceId } });
    return { success: true };
  }

  async search(organizationId: string, query: string, topK?: number) {
    return this.rag.search(organizationId, query, { topK: topK ?? 5 });
  }

  private async processSource(organizationId: string, sourceId: string, content: string | null, url?: string): Promise<void> {
    try {
      await this.prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: KnowledgeSourceStatus.PROCESSING, errorMessage: null },
      });

      let text = content;
      if (!text && url) {
        try {
          const res = await axios.get<string>(url, { timeout: 15000 });
          text = this.htmlToText(typeof res.data === 'string' ? res.data : '');
        } catch (err) {
          throw new Error(`Failed to fetch URL: ${(err as Error).message}`);
        }
      }
      if (!text) {
        throw new Error('No content to process');
      }

      const chunks = await this.rag.chunkText(text, { chunkSize: 800, overlap: 80 });
      const embeddings = await this.rag.embed(chunks);

      // Persist chunks
      // Persist chunks using raw SQL because Prisma disables create for models with required Unsupported fields
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const tokenCount = c.split(/\s+/).length;
        // In PostgreSQL, pgvector expects a string like '[1,2,3]'
        const embStr = JSON.stringify(embeddings[i] ?? new Array(768).fill(0));
        await this.prisma.$executeRaw`
          INSERT INTO "KnowledgeChunk" ("id", "organizationId", "sourceId", "content", "chunkIndex", "tokenCount", "metadata", "embedding")
          VALUES (uuid_generate_v4(), ${organizationId}::uuid, ${sourceId}::uuid, ${c}, ${i}, ${tokenCount}, '{}'::jsonb, ${embStr}::vector)
        `;
      }

      await this.rag.upsert(
        organizationId,
        sourceId,
        chunks.map((c, i) => ({ content: c, embedding: embeddings[i] ?? [], metadata: { chunkIndex: i } })),
      );

      await this.prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: KnowledgeSourceStatus.READY, chunkCount: chunks.length },
      });
    } catch (err) {
      const message = (err as Error).message;
      this.logger.error(`KB source ${sourceId} processing failed: ${message}`);
      await this.prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: KnowledgeSourceStatus.FAILED, errorMessage: message },
      });
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}