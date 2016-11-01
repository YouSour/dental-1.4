import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Payment} from '../../common/collections/payment.js';
import {Register} from '../../common/collections/register.js';

Payment.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc._id = idGenerator.genWithPrefix(Payment, prefix, 12);

    Register.update(doc.registerId, {$set: {paymentStatus: 'exist'}});
});

Payment.after.remove(function (userId, doc) {
    let paymentCount = Payment.find({registerId: doc.registerId}).count();
    if (paymentCount == 0) {
        Register.update(doc.registerId, {$set: {paymentStatus: ''}});
    }
});
