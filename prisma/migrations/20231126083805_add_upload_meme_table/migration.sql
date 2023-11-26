-- CreateTable
CREATE TABLE "Dummy" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Dummy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemeUpload" (
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "MemeUpload_pkey" PRIMARY KEY ("fileId")
);
