const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { selectPhotos, listEstampas } = require("./photo-selector");

const TEMPLATES_DIR = __dirname;
const OUTPUT_ROOT = path.resolve(__dirname, "../output");

const TEMPLATE_CONFIG = {
  post4: {
    file: "post4-foto-pura.html",
    width: 1080,
    height: 1350,
    defaultCount: 3,
    variety: true,
  },
};

async function render({ template = "post4", estampa, count, outputDir }) {
  const config = TEMPLATE_CONFIG[template];
  if (!config) {
    throw new Error(
      `Unknown template "${template}". Available: ${Object.keys(TEMPLATE_CONFIG).join(", ")}`
    );
  }

  count = count || config.defaultCount;

  // Select photos
  console.log(`Selecting ${count} photos for "${estampa}"...`);
  const photos = selectPhotos({ estampa, count, variety: config.variety, template });
  console.log(
    `Selected: ${photos.map((p) => `${p.shot}/${p.subject}`).join(", ")}`
  );

  // Read HTML template
  const templatePath = path.join(TEMPLATES_DIR, config.file);
  const templateHtml = fs.readFileSync(templatePath, "utf-8");

  // Create output directory
  const date = new Date().toISOString().split("T")[0];
  const outDir = outputDir || path.join(OUTPUT_ROOT, `${template}-${estampa}-${date}`);
  fs.mkdirSync(outDir, { recursive: true });

  // Launch browser
  console.log("Launching browser...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: 1,
  });

  const slides = [];
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const photoUri = `file:///${photo.path.replace(/\\/g, "/")}`;

    // Fill template
    const html = templateHtml
      .replaceAll("{{photo}}", photoUri)
      .replaceAll("{{width}}", String(config.width))
      .replaceAll("{{height}}", String(config.height));

    // Write temp HTML
    const tempHtml = path.join(outDir, `_temp_slide_${i + 1}.html`);
    fs.writeFileSync(tempHtml, html);

    // Screenshot
    const page = await context.newPage();
    await page.goto(`file:///${tempHtml.replace(/\\/g, "/")}`);
    await page.waitForLoadState("networkidle");

    const slideFile = path.join(outDir, `slide-${i + 1}.jpg`);
    await page.screenshot({
      path: slideFile,
      type: "jpeg",
      quality: 95,
      clip: { x: 0, y: 0, width: config.width, height: config.height },
    });
    await page.close();

    // Clean up temp HTML
    fs.unlinkSync(tempHtml);

    slides.push({
      file: slideFile,
      photo: photo.filename,
      shot: photo.shot,
      subject: photo.subject,
    });
    console.log(
      `  Slide ${i + 1}/${photos.length}: ${photo.shot}/${photo.subject} -> ${path.basename(slideFile)}`
    );
  }

  await browser.close();

  // Write manifest
  const manifest = {
    template,
    estampa,
    date,
    slides,
    outputDir: outDir,
  };
  const manifestPath = path.join(outDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\nDone! ${slides.length} slides saved to:\n  ${outDir}`);
  return manifest;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith("--")) {
      flags[args[i].slice(2)] = args[i + 1];
    }
  }

  if (flags.list) {
    const estampas = listEstampas();
    console.log(`\n${estampas.length} estampas:\n`);
    for (const e of estampas) {
      console.log(
        `  ${e.name} (${e.count} photos, shots: ${e.shots.join(", ")})`
      );
    }
    process.exit(0);
  }

  if (!flags.estampa) {
    console.log("Usage:");
    console.log(
      "  node render.js --template post4 --estampa tt-vichy-rosa [--count 3]"
    );
    console.log("  node render.js --list true");
    process.exit(1);
  }

  render({
    template: flags.template || "post4",
    estampa: flags.estampa,
    count: flags.count ? parseInt(flags.count) : undefined,
  }).catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}

module.exports = { render, TEMPLATE_CONFIG };
