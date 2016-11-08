import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Deposit} from '../../common/collections/deposit.js';
import {Register} from '../../common/collections/register.js';
Deposit.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc._id = idGenerator.genWithPrefix(Deposit, prefix, 12);

    Register.update(doc.registerId, {$set: {depositStatus: 'exist'}});
});

Deposit.before.remove(function (userId, doc) {
    let depositCount = Deposit.find({registerId: doc.registerId}).count();

    if (depositCount == 0) {
        Register.update(doc.registerId, {$set: {depositStatus: ''}});
    }
});