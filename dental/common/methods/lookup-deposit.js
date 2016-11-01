import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Register} from '../collections/register.js';

export const lookupDeposit = new ValidatedMethod({
    name: 'dental.lookupDeposit',
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
                    $project: {
                        _id: 1,
                        branchId: 1,
                        items: 1,
                        patientId: 1,
                        registerDate: 1,
                        closedDate: 1,
                        depositDoc: 1,
                        total: 1,
                        depositCount: {$size: '$depositDoc'}

                    }
                },
                {
                    $project: {
                        _id: 1,
                        patientId: 1,
                        closedDate: 1,
                        registerDate: 1,
                        depositType: {
                            $cond: [
                                {$eq: ["$depositCount", 0]}, 'self', 'deposit'
                            ]
                        },
                        depositDoc: {
                            $cond: [
                                {$eq: ["$depositCount", 0]}, '$$ROOT', '$depositDoc'
                            ]
                        }
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
                        patientId: {$last: '$patientId'},
                        deposit: {
                            $last: '$depositDoc'
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        patientId: 1,
                        deposit: 1,
                        closedDate: 1,
                        amount: {$ifNull: ["$deposit.total", "$deposit.balanceAmount"]}
                    }
                }
            ]);

            return data[0];
        }
    }
});