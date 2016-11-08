import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company.js';
import {Register} from '../../collections/register.js';

export const registerInvoiceReport = new ValidatedMethod({
    name: 'dental.registerInvoiceReport',
    mixins: [CallPromiseMixin],
    // validate: null,
    validate: new SimpleSchema({
        registerId: {type: String}
    }).validator(),
    run({registerId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);

            let rptTitle, rptContent, rptFooter;

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Content ---
            rptContent = Register.aggregate([
                {
                    $match: {_id: registerId}
                },
                {
                    $lookup: {
                        from: "dental_deposit",
                        localField: "_id",
                        foreignField: "registerId",
                        as: "depositDoc"
                    }
                },
                {
                    $unwind: {path: '$depositDoc', preserveNullAndEmptyArrays: true}
                },
                {
                    $group: {
                        _id: "$_id",
                        patientId: {$last: "$patientId"},
                        items: {$last: "$items"},
                        depositDoc: {$addToSet: "$depositDoc"},
                        totalDeposit: {$sum: '$depositDoc.amount'},
                        registerDate: {$last: "$registerDate"},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        subTotal: {$last: "$subTotal"},
                        total: {$last: "$total"},
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
                    $unwind: {path: '$paymentDoc', preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: "dental_patient",
                        localField: "patientId",
                        foreignField: "_id",
                        as: "patientDoc"
                    }
                },
                {
                    $unwind: "$patientDoc"
                },
                {
                    $group: {
                        _id: "$_id",
                        registerDate: {$last: "$registerDate"},
                        patientId: {$last: "$patientId"},
                        depositDoc: {$last: "$depositDoc"},
                        totalDeposit: {$last: '$totalDeposit'},
                        items: {$last: "$items"},
                        paymentDoc: {$addToSet: "$paymentDoc"},
                        patientDoc: {$last: "$patientDoc"},
                        totalPayment: {$sum: '$paymentDoc.amount'},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        subTotal: {$last: "$subTotal"},
                        total: {$last: "$total"}

                    }
                },
                {
                    $unwind: {path: '$items', preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: "dental_diseaseItems",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "itemDoc"
                    }
                },
                {
                    $unwind: "$itemDoc"
                },
                {
                    $group: {
                        _id: "$_id",
                        registerDate: {$last: "$registerDate"},
                        patientId: {$last: "$patientId"},
                        depositDoc: {$last: "$depositDoc"},
                        totalDeposit: {$last: '$totalDeposit'},
                        items: {
                            $addToSet: {
                                itemId: "$items.itemId",
                                itemName: "$itemDoc.name",
                                qty: "$items.qty",
                                price: "$items.price",
                                discount: "$items.discount",
                                amount: "$items.amount"
                            }
                        },
                        paymentDoc: {$addToSet: "$paymentDoc"},
                        patientDoc: {$last: "$patientDoc"},
                        totalPayment: {$last: '$totalPayment'},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        subTotal: {$last: "$subTotal"},
                        total: {$last: "$total"}

                    }
                }
            ])[0];
            return {rptTitle, rptContent};
        }
    }
});
