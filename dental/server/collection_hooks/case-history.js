import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {CaseHistory} from '../../common/collections/case-history.js';

CaseHistory.before.insert(function (userId, doc) {
    doc._id = idGenerator.gen(CaseHistory, 3);
});
