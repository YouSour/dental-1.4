import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Payment} from '../../common/collections/payment.js';
import {Deposit} from '../../common/collections/deposit.js';
import {Register} from '../../common/collections/register.js';

Payment.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc._id = idGenerator.genWithPrefix(Payment, prefix, 12);

    if (doc.totalBalance == 0) {
        doc.condition = "Closed";
        Register.update(doc.registerId, {$set: {paymentCondition: 'closed'}});
    }else{
        Register.update(doc.registerId, {$set: {paymentCondition: 'partial'}});
    }

    Register.update(doc.registerId, {$set: {paymentStatus: 'exist'}});
});

Payment.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    console.log(modifier.$set.registerId);
    if (modifier.$set.totalBalance == 0) {
        modifier.$set.condition = "Closed";
        Register.update(modifier.$set.registerId, {$set: {paymentCondition: 'closed'}});
    } else {
        modifier.$set.condition = "Partial";
        Register.update(modifier.$set.registerId, {$set: {paymentCondition: 'partial'}});
    }
});

Payment.after.remove(function (userId, doc) {
    let paymentCount = Payment.find({registerId: doc.registerId}).count();
    if (paymentCount == 0) {
        Register.update(doc.registerId, {$set: {paymentStatus: "", paymentCondition: "partial"}});
    }
});
