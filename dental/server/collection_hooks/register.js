import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Register} from '../../common/collections/register.js';
import {Deposit} from '../../common/collections/deposit.js';
import {Payment} from '../../common/collections/payment.js';

Register.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc._id = idGenerator.genWithPrefix(Register, prefix, 9);
});

Register.before.remove(function (userId, doc) {
    Deposit.remove({registerId : doc._id});
    Payment.remove({registerId : doc._id});
});
