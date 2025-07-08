// compressor.js
const sharp = require("sharp");

const MAX_SIZE_KB = 200;

const compressImage = async (inputBuffer, fileExtension) => {
    let quality = 90;
    let sharpInstance = sharp(inputBuffer);
    const metadata = await sharpInstance.metadata();

    if (metadata.width > 1500) {
        sharpInstance = sharpInstance.resize({ width: 1500 });
    }

    while (quality >= 30) {
        let buffer;

        if (fileExtension === ".jpg" || fileExtension === ".jpeg") {
            buffer = await sharpInstance.jpeg({ quality }).toBuffer();
        } else if (fileExtension === ".png") {
            buffer = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
        } else if (fileExtension === ".webp") {
            buffer = await sharpInstance.webp({ quality }).toBuffer();
        } else {
            return null;
        }

        if (buffer.length / 1024 < MAX_SIZE_KB) {
            return buffer;
        }

        quality -= 10;
    }

    return sharpInstance.toBuffer();
};

const run = async () => {
    console.log("📦 Compressor subprocess started:", process.argv[2]);

    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }

    const inputBuffer = Buffer.concat(chunks);
    const ext = process.argv[2] || ".jpg";

    try {
        const compressed = await compressImage(inputBuffer, ext);
        if (compressed) {
            process.stdout.write(compressed);
        } else {
            process.stderr.write("Unsupported format");
            process.exit(1);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
