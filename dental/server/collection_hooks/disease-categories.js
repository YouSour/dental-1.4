import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {DiseaseCategories} from '../../common/collections/disease-categories.js';
import {DiseaseItems} from '../../common/collections/disease-items.js';

DiseaseCategories.before.insert(function (userId, doc) {
    doc._id = idGenerator.gen(DiseaseCategories, 3);
});

DiseaseCategories.before.remove(function (userId, doc) {
    DiseaseItems.remove({diseaseCategoriesId: doc._id});
});