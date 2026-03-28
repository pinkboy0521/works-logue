import uuid
from datetime import datetime, timezone
from typing import List
from uuid import UUID

from supabase import Client

from app.models.enums import NotificationType
from app.repositories.notification_repository import NotificationRepository
from app.repositories.seed_repository import SeedRepository
from app.utils.logging import setup_logger

logger = setup_logger("notification_service")


class NotificationService:
    def __init__(self, supabase: Client):
        self._db = supabase
        self._notif_repo = NotificationRepository(supabase)
        self._seed_repo = SeedRepository(supabase)

    async def notify_new_log(self, seed_id: UUID, log_user_id: UUID) -> None:
        """Notify the seed author when a new log is posted (not for self-logs)."""
        seed = self._seed_repo.get_by_id(seed_id)
        if seed is None:
            return
        seed_author_id = UUID(seed["user_id"])
        if seed_author_id == log_user_id:
            return  # self-log, no notification

        # Get log poster's name
        poster_res = self._db.table("profiles").select("display_name").eq("id", str(log_user_id)).single().execute()
        poster_name = (poster_res.data or {}).get("display_name", "Someone")

        self._notif_repo.create(
            {
                "id": str(uuid.uuid4()),
                "user_id": str(seed_author_id),
                "type": NotificationType.NEW_LOG.value,
                "reference_id": str(seed_id),
                "message": f"{poster_name}さんが「{seed['title']}」にLogを投稿しました",
                "is_read": False,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        logger.info(
            "Notification sent",
            extra={
                "type": NotificationType.NEW_LOG.value,
                "recipient": str(seed_author_id),
                "seed_id": str(seed_id),
            },
        )

    async def notify_louge_bloomed(self, seed_id: UUID, louge_id: UUID) -> None:
        """Notify all louge contributors when the louge is published."""
        seed = self._seed_repo.get_by_id(seed_id)
        if seed is None:
            return

        contributors_res = (
            self._db.table("louge_contributors")
            .select("user_id")
            .eq("louge_id", str(louge_id))
            .execute()
        )
        rows = []
        now = datetime.now(timezone.utc).isoformat()
        for c in contributors_res.data or []:
            rows.append(
                {
                    "id": str(uuid.uuid4()),
                    "user_id": c["user_id"],
                    "type": NotificationType.LOUGE_BLOOMED.value,
                    "reference_id": str(louge_id),
                    "message": f"「{seed['title']}」が開花し、Lougeが公開されました！",
                    "is_read": False,
                    "created_at": now,
                }
            )
        self._notif_repo.create_bulk(rows)
        logger.info(
            "LOUGE_BLOOMED notifications sent",
            extra={"louge_id": str(louge_id), "count": len(rows)},
        )

    async def notify_bloom_near(self, seed_id: UUID) -> None:
        """Notify followers when a seed reaches near_bloom stage (BR-02)."""
        seed = self._seed_repo.get_by_id(seed_id)
        if seed is None:
            return
        seed_author_id = UUID(seed["user_id"])

        targets = self._notif_repo.get_bloom_near_targets(seed_id, seed_author_id)
        if not targets:
            logger.info("No bloom_near targets, skipping", extra={"seed_id": str(seed_id)})
            return

        now = datetime.now(timezone.utc).isoformat()
        rows = [
            {
                "id": str(uuid.uuid4()),
                "user_id": str(uid),
                "type": NotificationType.BLOOM_NEAR.value,
                "reference_id": str(seed_id),
                "message": f"開花間近のSeedがあります: 「{seed['title']}」",
                "is_read": False,
                "created_at": now,
            }
            for uid in targets
        ]
        self._notif_repo.create_bulk(rows)
        logger.info(
            "BLOOM_NEAR notifications sent",
            extra={"seed_id": str(seed_id), "count": len(rows)},
        )
