CREATE TABLE "thuong_hieu" (
    "id" TEXT NOT NULL,
    "tenThuongHieu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thuong_hieu_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "thuong_hieu_tenThuongHieu_key" ON "thuong_hieu"("tenThuongHieu");

UPDATE "san_pham"
SET "thuongHieu" = regexp_replace(btrim("thuongHieu"), '\s+', ' ', 'g')
WHERE "thuongHieu" IS NOT NULL;

WITH normalized AS (
    SELECT regexp_replace(btrim("thuongHieu"), '\s+', ' ', 'g') AS name
    FROM "san_pham"
    WHERE "thuongHieu" IS NOT NULL AND btrim("thuongHieu") <> ''
)
INSERT INTO "thuong_hieu" ("id", "tenThuongHieu", "createdAt", "updatedAt")
SELECT 'brand_' || md5(lower(name)), min(name), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM normalized
GROUP BY lower(name)
ON CONFLICT ("tenThuongHieu") DO NOTHING;
