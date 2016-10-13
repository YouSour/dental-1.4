import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {LaboratoryItems} from '../../common/collections/laboratory-items.js';

LaboratoryItems.before.insert(function (userId, doc) {
    doc._id = idGenerator.gen(LaboratoryItems, 3);
});
