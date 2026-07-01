import { increaseAllPrices } from '../src/services/menu';

async function main() {
  console.log('Increasing all menu item prices by ₹10...');
  try {
    const updated = await increaseAllPrices(10);
    console.log(`Successfully updated ${updated.length} menu items.`);
    updated.forEach(item => {
      console.log(`  ${item.id}: ₹${item.price}`);
    });
  } catch (error) {
    console.error('Failed to update prices:', error);
    process.exit(1);
  }
}

main();