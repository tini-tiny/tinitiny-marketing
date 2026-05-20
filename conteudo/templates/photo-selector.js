const fs = require("fs");
const path = require("path");

const PHOTOS_ROOT = path.resolve(__dirname, "../../fotos/__classificacao");

const SHOT_PRIORITY = ["overhead", "wide", "profile", "closeup", "flatlay"];
const SUBJECT_PRIORITY = [
  "crianca",
  "pezinhos",
  "maos",
  "brinquedos",
  "tapete",
  "embalagem",
  "montagem",
  "ambiente",
];

// Template-specific presets override default priorities
const TEMPLATE_PRESETS = {
  post4: {
    // Pure photo carousel: tapete must be hero, prefer overhead/wide where mat dominates
    shotPriority: ["overhead", "wide", "closeup", "flatlay"],
    subjectPriority: ["crianca", "pezinhos", "tapete", "brinquedos"],
    excludeSubjects: ["embalagem", "montagem", "ambiente"],
  },
};

function parsePhotoName(filename) {
  // Format: {estampa}_{shot}_{sujeito}_{numero}.jpg
  const match = filename.match(
    /^(.+)_(overhead|closeup|wide|profile|flatlay)_([^_]+)_(.+)\.(jpg|jpeg)$/i
  );
  if (!match) return null;
  return {
    estampa: match[1],
    shot: match[2],
    subject: match[3],
    id: match[4],
    filename,
  };
}

function selectPhotos({ estampa, count = 3, variety = true, template = null }) {
  const preset = template ? TEMPLATE_PRESETS[template] : null;
  const shotOrder = preset?.shotPriority || SHOT_PRIORITY;
  const subjectOrder = preset?.subjectPriority || SUBJECT_PRIORITY;
  const excludeSubjects = new Set(preset?.excludeSubjects || []);
  // Scan all classification folders for matching estampa
  const folders = fs.readdirSync(PHOTOS_ROOT).filter((f) => {
    const full = path.join(PHOTOS_ROOT, f);
    return fs.statSync(full).isDirectory() && !f.startsWith("__");
  });

  const allPhotos = [];
  for (const folder of folders) {
    const folderPath = path.join(PHOTOS_ROOT, folder);
    const files = fs.readdirSync(folderPath).filter((f) => {
      return (
        f.toLowerCase().startsWith(estampa.toLowerCase() + "_") &&
        /\.(jpg|jpeg)$/i.test(f)
      );
    });
    for (const file of files) {
      const parsed = parsePhotoName(file);
      if (parsed) {
        parsed.path = path.join(folderPath, file);
        allPhotos.push(parsed);
      }
    }
  }

  // Apply preset filters
  const filtered = allPhotos.filter((p) => !excludeSubjects.has(p.subject));

  if (filtered.length === 0) {
    throw new Error(
      `No photos found for estampa "${estampa}". Available in ${PHOTOS_ROOT}`
    );
  }

  if (!variety) {
    return rankAndPick(filtered, count, shotOrder, subjectOrder);
  }

  return pickVaried(filtered, count, shotOrder, subjectOrder);
}

function pickVaried(photos, count, shotOrder, subjectOrder) {
  // Group by shot type
  const byShot = {};
  for (const p of photos) {
    if (!byShot[p.shot]) byShot[p.shot] = [];
    byShot[p.shot].push(p);
  }

  // Sort each group by subject priority (best subject first, unknown last)
  const subjectRank = (s) => {
    const idx = subjectOrder.indexOf(s);
    return idx === -1 ? 999 : idx;
  };
  for (const shot in byShot) {
    byShot[shot].sort((a, b) => subjectRank(a.subject) - subjectRank(b.subject));
  }

  // Pick one from each shot type in priority order
  const selected = [];

  for (const shot of shotOrder) {
    if (selected.length >= count) break;
    if (byShot[shot] && byShot[shot].length > 0) {
      selected.push(byShot[shot][0]);
    }
  }

  // If not enough variety, fill from remaining photos
  if (selected.length < count) {
    const remaining = photos.filter(
      (p) => !selected.some((s) => s.path === p.path)
    );
    const subjectRank2 = (s) => {
      const idx = subjectOrder.indexOf(s);
      return idx === -1 ? 999 : idx;
    };
    remaining.sort((a, b) => subjectRank2(a.subject) - subjectRank2(b.subject));
    for (const p of remaining) {
      if (selected.length >= count) break;
      selected.push(p);
    }
  }

  // Order: first shot in priority = cover photo
  selected.sort(
    (a, b) => shotOrder.indexOf(a.shot) - shotOrder.indexOf(b.shot)
  );

  return selected.slice(0, count);
}

function rankAndPick(photos, count, shotOrder, subjectOrder) {
  photos.sort((a, b) => {
    const shotDiff = shotOrder.indexOf(a.shot) - shotOrder.indexOf(b.shot);
    if (shotDiff !== 0) return shotDiff;
    return subjectOrder.indexOf(a.subject) - subjectOrder.indexOf(b.subject);
  });
  return photos.slice(0, count);
}

function listEstampas() {
  const folders = fs.readdirSync(PHOTOS_ROOT).filter((f) => {
    const full = path.join(PHOTOS_ROOT, f);
    return fs.statSync(full).isDirectory() && !f.startsWith("__");
  });

  const estampas = new Map();
  for (const folder of folders) {
    const folderPath = path.join(PHOTOS_ROOT, folder);
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => /\.(jpg|jpeg)$/i.test(f));
    for (const file of files) {
      const parsed = parsePhotoName(file);
      if (parsed) {
        if (!estampas.has(parsed.estampa)) {
          estampas.set(parsed.estampa, { count: 0, shots: new Set() });
        }
        const entry = estampas.get(parsed.estampa);
        entry.count++;
        entry.shots.add(parsed.shot);
      }
    }
  }

  return [...estampas.entries()]
    .map(([name, data]) => ({
      name,
      count: data.count,
      shots: [...data.shots],
    }))
    .sort((a, b) => b.count - a.count);
}

module.exports = { selectPhotos, listEstampas, parsePhotoName };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === "--list") {
    const estampas = listEstampas();
    console.log(`\n${estampas.length} estampas found:\n`);
    for (const e of estampas) {
      console.log(`  ${e.name} (${e.count} photos, shots: ${e.shots.join(", ")})`);
    }
  } else {
    const estampa = args[0] || "tt-vichy-rosa";
    const count = parseInt(args[1]) || 3;
    const photos = selectPhotos({ estampa, count, variety: true });
    console.log(`\nSelected ${photos.length} photos for "${estampa}":\n`);
    for (const p of photos) {
      console.log(`  [${p.shot}/${p.subject}] ${p.filename}`);
      console.log(`    ${p.path}`);
    }
  }
}
