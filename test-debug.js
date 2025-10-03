const CategoryManager = require('./src/managers/category-manager');

const manager = new CategoryManager();
const cat1 = manager.createCategory('Important', '#ff0000');
const cat2 = manager.createCategory('Urgent', '#00ff00');

console.log('Before delete:',  manager.getAllCategories().length);
console.log('cat1.id:', cat1.id);
console.log('cat2.id:', cat2.id);

manager.deleteCategory(cat1.id);

console.log('After delete:', manager.getAllCategories().length);
console.log('Remaining categories:', manager.getAllCategories());
