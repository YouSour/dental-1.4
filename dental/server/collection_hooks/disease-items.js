import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {DiseaseItems} from '../../common/collections/disease-items.js';

DiseaseItems.before.insert(function (userId, doc) {
    doc._id = idGenerator.gen(DiseaseItems, 6);
});
