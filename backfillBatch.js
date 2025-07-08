import PocketBase from 'pocketbase';

const pb = new PocketBase('https://edita.pockethost.io');

function getBatchFromId(id) {
  if (!id) return 'Unknown';
  // Assuming roll number is the first 6 digits of id (before the random numbers)
  const roll = id.slice(0, 6);
  if (roll.startsWith('23')) return '2023-27';
  if (roll.startsWith('24')) return '2024-28';
  return 'Unknown';
}

async function backfill() {
  const records = await pb.collection('gpa').getFullList({ batch: 200 });
  for (const record of records) {
    const batch = getBatchFromId(record.id);
    await pb.collection('gpa').update(record.id, { batch });
    console.log(`Updated ${record.id} with batch ${batch}`);
  }
}

backfill().catch(console.error); 