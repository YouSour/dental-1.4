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
import {Paitent} from '../../collections/patient';
import {Staff} from '../../collections/staff';
import {Payment} from '../../collections/payment';

export const paymentReport = new ValidatedMethod({
    name: 'dental.paymentReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(2000);

            let rptTitle, rptHeader, rptContent, rptFooter;

            let fDate = moment(params.repDate[0]).toDate();
            let tDate = moment(params.repDate[1]).toDate();

            // console.log("F: " + fDate + "| T: " + tDate);

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Header ---
            // Branch
            let branchDoc = Branch.find({_id: {$in: params.branchId}});
            params.branchHeader = _.map(branchDoc.fetch(), function (val) {
                return `${val._id} : ${val.enName}`;
            });

            let staffDoc = Staff.findOne(params.staffId);
            params.staffHeader = _.isUndefined(staffDoc) ? "All" : `${staffDoc._id} : ${staffDoc.name}`;
            params.conditionHeader = _.isUndefined(params.condition) ? "All" : params.condition;
            // Exchange
            let exchangeDoc = Exchange.findOne(params.exchangeId);
            params.exchangeHeader = JSON.stringify(exchangeDoc.rates, null, ' ');

            rptHeader = params;

            // --- Content ---
            let selector = {};
            selector.branchId = {$in: params.branchId};
            if (!_.isUndefined(params.staffId)) selector.staffId = params.staffId;
            if (!_.isUndefined(params.condition)) selector.condition = params.condition;
            selector.paidDate = {$gte: fDate, $lte: tDate};

            rptContent = Payment.aggregate([
                {
                    $match: selector
                },
                {
                    $unwind: "$items"
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
                        registerId: {$last: "$registerId"},
                        patientId: {$last: "$patientId"},
                        patientDoc: {$last: "$patientDoc"},
                        paidDate: {$last: "$paidDate"},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        total: {$last: "$amount"},
                        items: {
                            $addToSet: {
                                itemId: "$items.itemId",
                                itemName: "$itemDoc.name",
                                qty: "$items.qty",
                                price: "$items.price",
                                amount: "$items.amount"
                            }
                        }
                    }
                },
                {
                    $sort: {paidDate: -1}
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
