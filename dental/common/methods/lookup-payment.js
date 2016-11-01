import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Register} from '../collections/register.js';

export const lookupPayment = new ValidatedMethod({
    name: 'dental.lookupPayment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        registerId: {type: String}
    }).validator(),
    run({registerId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);
            let data = Register.aggregate([
                {$match: {_id: registerId}},
                {
                    $lookup: {
                        from: "dental_deposit",
                        localField: "_id",
                        foreignField: "registerId",
                        as: "depositDoc"
                    }
                },
                {
                    $lookup: {
                        from: "dental_payment",
                        localField: "_id",
                        foreignField: "registerId",
                        as: "paymentDoc"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        branchId: 1,
                        items: 1,
                        patientId: 1,
                        registerDate: 1,
                        paymentDoc: 1,
                        depositDoc: 1,
                        total: 1,
                        closedDate: 1,
                        paymentCount: { $size: '$paymentDoc' },
                        depositCount: { $size: '$depositDoc' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        patientId: 1,
                        registerDate: 1,
                        closedDate: 1,
                        paymentType: {
                            $cond: [
                                { $eq: ["$paymentCount", 0] }, 'self', 'payment'
                            ]
                        },
                        paymentDoc: {
                            $cond: {
                                if: { $ne: ["$paymentCount", 0] },
                                then: '$paymentDoc',
                                else: {
                                    $cond: {
                                        if: { $ne: ["$depositCount", 0] },
                                        then: '$depositDoc',
                                        else: '$$ROOT'
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$paymentDoc', preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: '$depositDoc', preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        closedDate: {$last: '$closedDate'},
                        patientId: { $last: '$patientId' },
                        payment: {
                            $last: '$paymentDoc'
                        },
                        deposit: {
                            $last: "$depositDoc"
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        patientId: 1,
                        payment: 1,
                        closedDate: 1,
                        amount: { $ifNull: ["$payment.total", "$payment.balanceAmount"] }
                    }
                }
            ]);
            return data[0];
        }
    }
});