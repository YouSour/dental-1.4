import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company';
import {Branch} from '../../../../core/common/collections/branch';
import {Exchange} from '../../../../core/common/collections/exchange';
import {Register} from '../../collections/register';

export const closedRegisterReport = new ValidatedMethod({
    name: 'dental.closedRegisterReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(2000);

            let rptTitle, rptHeader, rptContent, rptFooter;

            let date = moment(params.repDate).add(1, 'days').toDate();

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Header ---
            // Branch
            let branchDoc = Branch.find({_id: {$in: params.branchId}});
            params.branchHeader = _.map(branchDoc.fetch(), function (val) {
                return `${val._id} : ${val.enName}`;
            });

            // Exchange
            let exchangeDoc = Exchange.findOne(params.exchangeId);
            params.exchangeHeader = JSON.stringify(exchangeDoc.rates, null, ' ');

            rptHeader = params;

            // --- Content ---
            let selector = {};
            selector.branchId = {$in: params.branchId};
            selector.closedDate = {$lte: date};
            selector.paymentCondition = {$eq: "partial"};

            rptContent = Register.aggregate([
                {
                    $match: selector
                },
                {
                    $lookup: {
                        from: "dental_deposit",
                        localField: "_id",
                        foreignField: "registerId",
                        as: "depositDoc"
                    }
                },
                {$unwind: {path: "$depositDoc", preserveNullAndEmptyArrays: true}},
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
                    $project: {
                        _id: 1,
                        registerDate: 1,
                        patientId: 1,
                        patientDoc: 1,
                        closedDate: 1,
                        subTotal: 1,
                        depositDoc: {$cond: [{$lte: ["$depositDoc.paidDate", date]}, "$depositDoc", 0]}
                    }

                },
                {
                    $group: {
                        _id: "$_id",
                        registerDate: {$last: "$registerDate"},
                        patientId: {$last: "$patientId"},
                        patientDoc: {$last: "$patientDoc"},
                        closedDate: {$last: "$closedDate"},
                        subTotal: {$last: "$subTotal"},
                        totalDeposit: {$sum: "$depositDoc.amount"},
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
                {$unwind: {path: "$paymentDoc", preserveNullAndEmptyArrays: true}},
                {
                    $project: {
                        _id: 1,
                        registerDate: 1,
                        patientId: 1,
                        patientDoc: 1,
                        closedDate: 1,
                        subTotal: 1,
                        totalDeposit: 1,
                        paymentDoc: {$cond: [{$lte: ["$paymentDoc.paidDate", date]}, "$paymentDoc", 0]}
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        registerDate: {$last: "$registerDate"},
                        patientId: {$last: "$patientId"},
                        patientDoc: {$last: "$patientDoc"},
                        closedDate: {$last: "$closedDate"},
                        subTotal: {$last: "$subTotal"},
                        totalDeposit: {$last: "$totalDeposit"},
                        totalPayment: {$sum: "$paymentDoc.amount"},
                    }
                },
                {
                    $project: {
                        _id: 1,
                        registerDate: 1,
                        patientId: 1,
                        patientDoc: 1,
                        closedDate: 1,
                        subTotal: 1,
                        totalDeposit: 1,
                        totalPayment: 1,
                        sumDepositWithPayment: {$add: ["$totalDeposit", "$totalPayment"]}
                    }
                },
                {
                    $project: {
                        _id: 1,
                        registerDate: 1,
                        patientId: 1,
                        patientDoc: 1,
                        closedDate: 1,
                        subTotal: 1,
                        totalDeposit: 1,
                        totalPayment: 1,
                        sumDepositWithPayment: 1,
                        total: {$subtract: ["$subTotal", "$sumDepositWithPayment"]}
                    }
                },
                {
                    $sort: {registerDate: -1}
                },
                {
                    $group: {
                        _id: null,
                        data: {$addToSet: "$$ROOT"},
                        sumTotal: {$sum: "$total"}
                    }
                }
            ])[0];

            return {rptTitle, rptHeader, rptContent};
        }
    }
});
