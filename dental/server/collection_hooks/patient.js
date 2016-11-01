import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Patient} from '../../common/collections/patient.js';
import {Register} from '../../common/collections/register.js';
import {Deposit} from '../../common/collections/deposit.js';
import {Payment} from '../../common/collections/payment.js';

Patient.before.insert(function (userId, doc) {
    let prefix = doc.branchId + '-';
    doc._id = idGenerator.genWithPrefix(Patient, prefix, 6);
});

Patient.before.remove(function (userId, doc) {
    Register.remove({patientId: doc._id});
    Deposit.remove({patientId: doc._id});
    Payment.remove({patientId: doc._id});
});