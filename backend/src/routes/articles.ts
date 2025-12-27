// backend/src/routes/articles.ts
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  createArticle,
  findArticleById,
  findArticlesByAuthor,
  publishArticle,
  updateArticle,
} from "../domain/article-service.js";
import type {
  ArticleResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
} from "../domain/article.js";
import { findOrCreateUser } from "../domain/user-service.js";
import type { AuthUser } from "../types/auth.js";

// JWT検証済みリクエストの型
interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

export default async function articlesRoute(app: FastifyInstance) {
  // POST /articles - ドラフト記事作成
  app.post<{
    Body: CreateArticleRequest;
  }>(
    "/articles",
    {
      preHandler: app.authenticate,
      schema: {
        body: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", maxLength: 500 },
            content: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const authRequest = request as AuthenticatedRequest;
        const authUser = authRequest.user;

        if (!authUser?.sub) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "認証ユーザー情報が見つかりません",
          });
        }

        // ユーザーを自動作成または既存取得してユーザーIDを取得
        const user = await findOrCreateUser({
          external_subject: authUser.sub,
          email: authUser.email || `user-${authUser.sub}@auth0.com`,
          name: authUser.name || "Unknown User",
        });

        const article = await createArticle({
          title: request.body.title,
          content: request.body.content,
          author_id: user.id, // 正しいユーザーIDを使用
        });

        const response: ArticleResponse = {
          id: article.id,
          title: article.title,
          content: article.content,
          status: article.status,
          author_id: article.author_id,
          published_at: article.published_at?.toISOString() || null,
          created_at: article.created_at.toISOString(),
          updated_at: article.updated_at.toISOString(),
        };

        return reply.status(201).send(response);
      } catch (error) {
        app.log.error({ error }, "Failed to create article");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "記事作成に失敗しました",
        });
      }
    }
  );

  // PUT /articles/:id - ドラフト記事更新
  app.put<{
    Params: { id: string };
    Body: UpdateArticleRequest;
  }>(
    "/articles/:id",
    {
      preHandler: app.authenticate,
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string", maxLength: 500 },
            content: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const authRequest = request as AuthenticatedRequest;
        const authUser = authRequest.user;

        if (!authUser?.sub) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "認証ユーザー情報が見つかりません",
          });
        }

        // ユーザーを自動作成または既存取得してユーザーIDを取得
        const user = await findOrCreateUser({
          external_subject: authUser.sub,
          email: authUser.email || `user-${authUser.sub}@auth0.com`,
          name: authUser.name || "Unknown User",
        });

        const article = await updateArticle(
          request.params.id,
          user.id, // 正しいユーザーIDを使用
          request.body
        );

        if (!article) {
          return reply.status(404).send({
            error: "Not Found",
            message: "記事が見つからないか、編集権限がありません",
          });
        }

        const response: ArticleResponse = {
          id: article.id,
          title: article.title,
          content: article.content,
          status: article.status,
          author_id: article.author_id,
          published_at: article.published_at?.toISOString() || null,
          created_at: article.created_at.toISOString(),
          updated_at: article.updated_at.toISOString(),
        };

        return reply.send(response);
      } catch (error) {
        app.log.error({ error }, "Failed to update article");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "記事更新に失敗しました",
        });
      }
    }
  );

  // POST /articles/:id/publish - 記事公開
  app.post<{
    Params: { id: string };
  }>(
    "/articles/:id/publish",
    {
      preHandler: app.authenticate,
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const authRequest = request as AuthenticatedRequest;
        const authUser = authRequest.user;

        if (!authUser?.sub) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "認証ユーザー情報が見つかりません",
          });
        }

        // ユーザーを自動作成または既存取得してユーザーIDを取得
        const user = await findOrCreateUser({
          external_subject: authUser.sub,
          email: authUser.email || `user-${authUser.sub}@auth0.com`,
          name: authUser.name || "Unknown User",
        });

        const article = await publishArticle(
          request.params.id,
          user.id // 正しいユーザーIDを使用
        );

        if (!article) {
          return reply.status(404).send({
            error: "Not Found",
            message: "記事が見つからないか、公開権限がありません",
          });
        }

        const response: ArticleResponse = {
          id: article.id,
          title: article.title,
          content: article.content,
          status: article.status,
          author_id: article.author_id,
          published_at: article.published_at?.toISOString() || null,
          created_at: article.created_at.toISOString(),
          updated_at: article.updated_at.toISOString(),
        };

        return reply.send(response);
      } catch (error) {
        app.log.error({ error }, "Failed to publish article");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "記事公開に失敗しました",
        });
      }
    }
  );

  // GET /articles/mine - 自分の記事一覧取得
  app.get<{}>(
    "/articles/mine",
    {
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      try {
        const authRequest = request as AuthenticatedRequest;
        const authUser = authRequest.user;

        if (!authUser?.sub) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "認証ユーザー情報が見つかりません",
          });
        }

        // ユーザーを自動作成または既存取得してユーザーIDを取得
        const user = await findOrCreateUser({
          external_subject: authUser.sub,
          email: authUser.email || `user-${authUser.sub}@auth0.com`,
          name: authUser.name || "Unknown User",
        });

        const articles = await findArticlesByAuthor(user.id);

        const response: ArticleResponse[] = articles.map((article) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          status: article.status,
          author_id: article.author_id,
          published_at: article.published_at?.toISOString() || null,
          created_at: article.created_at.toISOString(),
          updated_at: article.updated_at.toISOString(),
        }));

        return reply.send(response);
      } catch (error) {
        app.log.error({ error }, "Failed to fetch articles");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "記事取得に失敗しました",
        });
      }
    }
  );

  // GET /articles/:id - 記事詳細取得
  app.get<{
    Params: { id: string };
  }>(
    "/articles/:id",
    {
      preHandler: app.authenticate,
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const authRequest = request as AuthenticatedRequest;
        const authUser = authRequest.user;

        if (!authUser?.sub) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "認証ユーザー情報が見つかりません",
          });
        }

        // ユーザーを自動作成または既存取得してユーザーIDを取得
        const user = await findOrCreateUser({
          external_subject: authUser.sub,
          email: authUser.email || `user-${authUser.sub}@auth0.com`,
          name: authUser.name || "Unknown User",
        });

        const article = await findArticleById(
          request.params.id,
          user.id // 正しいユーザーIDを使用
        );

        if (!article) {
          return reply.status(404).send({
            error: "Not Found",
            message: "記事が見つからないか、閲覧権限がありません",
          });
        }

        const response: ArticleResponse = {
          id: article.id,
          title: article.title,
          content: article.content,
          status: article.status,
          author_id: article.author_id,
          published_at: article.published_at?.toISOString() || null,
          created_at: article.created_at.toISOString(),
          updated_at: article.updated_at.toISOString(),
        };

        return reply.send(response);
      } catch (error) {
        app.log.error({ error }, "Failed to fetch article");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "記事取得に失敗しました",
        });
      }
    }
  );
}
