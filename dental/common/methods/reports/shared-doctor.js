import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company';
import {Branch} from '../../../../core/common/collections/branch';
// import {Exchange} from '../../../../core/common/collections/exchange';
import {Doctor} from '../../collections/doctor';
import {Register} from '../../collections/register';
import {Deposit} from '../../collections/deposit';
import {Payment} from '../../collections/payment';

Meteor.methods({
    dental_sharedDoctor: function (params) {
        if (!_.isNull(params)) {
            var self = params;

            var data = {
                title: {},
                header: {},
                content: [],
                deposit: [],
                footer: {}
            };

            /********* Title *********/
            var company = Company.findOne();

            data.title = {
                company: company,
                date: self.repDate
            };

            /********* Header ********/
            var branch, sharedDate = moment(self.repDate[0]).format("DD/MM/YYYY") + " - " + moment(self.repDate[1]).format("DD/MM/YYYY");
            let branchDoc = Branch.find({_id: {$in: self.branchId}});
            if (self.branchId != "") {
                branch = _.map(branchDoc.fetch(), function (val) {
                    return `${val._id} : ${val.enName}`;
                });
            } else {
                branch = "All";
            }

            data.header = [{
                col1: '<b>' + 'Branch: ' + '</b>' + branch,
                col2: '<b>' + 'Date: ' + '</b>' + sharedDate
        }];

            /********** Content & Footer **********/

            var selectorDoctor = {};
            var selector = {};


            let fromDate = moment(self.repDate[0]).toDate();
            let toDate = moment(self.repDate[1]).toDate();

            // selector.status = "Close";
            // selectorDoctor.status = "Close";

            var selectorPayment = {};
            var selectorDeposite = {};


            if (self.branchId != "") {
                selector.branchId = {$in: self.branchId};
                selectorDoctor.branchId = {$in: self.branchId};
                selectorPayment.branchId = {$in: self.branchId};
                selectorDeposite.branchId = {$in: self.branchId};
            }

            if (self.repDate != null) {
                // selectorDoctor.closingDate = {
                //   $gte: fromDate,
                //   $lte: toDate
                // };
                // selector.closedDate = {
                //     $gte: fromDate,
                //     $lte: toDate
                // };
                selectorPayment.paidDate = {
                    $gte: fromDate,
                    $lte: toDate
                };
                selectorDeposite.paidDate = {
                    $gte: fromDate,
                    $lte: toDate
                };
            }


            var paymentDoc = Payment.find(selectorPayment);
            var depositeDoc = Deposit.find(selectorDeposite);

            var shareDoc = [];
            var registerId = [];

            var grandTotal = 0;
            var laboExpenseTemp = 0;
            paymentDoc.forEach(function (payDoc) {
                registerId.push(payDoc.registerId);
                shareDoc.push({
                    registerId: payDoc.registerId,
                    amount: payDoc.amount
                });
            });

            depositeDoc.forEach(function (depDoc) {
                registerId.push(depDoc.registerId);
                shareDoc.push({
                    registerId: depDoc.registerId,
                    amount: depDoc.amount
                });
            });


            selector._id = {
                $in: registerId
            };


            var doctorList = Register.aggregate([{
                $match: selectorDoctor
            }, {
                $unwind: "$items"
            }, {
                $group: {
                    _id: {
                        doctorId: "$items.doctor",
                    },
                    amount: {
                        $sum: "$items.amount"
                    }
                }
            }, {
                $sort: {
                    "_id.doctor": 1
                }
            }]);

            var content = [];
            console.log(doctorList);
            doctorList.forEach(function (doctorObj) {
                selector['items.doctor'] = doctorObj._id.doctorId;
                var results = Register.find(selector).fetch();


                console.log(results);
                var doctorDoc = Doctor.findOne({
                    _id: doctorObj._id.doctorId
                });
                console.log(doctorDoc);

                if (!_.isUndefined(doctorDoc)) {
                    content.push({
                        isHeader: true,
                        isFooter: false,
                        doctorId: doctorObj._id.doctorId + " : " + doctorDoc.name
                        // ,
                        // totalAmount: doctorObj.amount
                    });
                }

                var totalAmount = 0;
                var totalAmountBeforeDateFinal = 0;
                results.forEach(function (obj) {
                    var detailObj = {};
                    var paidAmount = 0;
                    var paidAmountTotal = 0;
                    var depositAmount = 0;
                    var depositAmountTotal = 0;
                    var paidAmountTotalBeforeDate = 0;
                    var depositAmountTotalBeforeDate = 0;
                    var laboExpense = 0;

                    detailObj.registerId = obj._id;
                    detailObj.date = obj.registerDate;
                    detailObj.patient = obj.patientId;
                    // + ' : ' + obj._patient.name +
                    // ' (' + obj._patient.gender + ')';
                    detailObj.subTotal = obj.subTotal;
                    // detailObj.deposit = obj.deposit;
                    detailObj.subDiscount = obj.subDiscount;
                    detailObj.totalDue = obj.total;
                    // detailObj.invoiceAmount = obj.subTotal - obj.subDiscount;
                    detailObj.invoiceAmount = obj.subTotal;
                    obj.items.forEach(function (o) {
                        laboExpense += o.laboAmount;
                    });
                    detailObj.laboExpense = laboExpense;
                    // Amount Pay until the end of Date Filter
                    Payment.find({
                        registerId: obj._id,
                        paidDate: {
                            $lte: toDate
                        }
                    }).forEach(function (obj) {
                        paidAmountTotal += obj.amount;
                    });
                    // Amount Pay Before Date Filter
                    Payment.find({
                        registerId: obj._id,
                        paidDate: {
                            $lt: fromDate
                        }
                    }).forEach(function (obj) {
                        paidAmountTotalBeforeDate += obj.amount;
                    });

                    // Amount Pay at Date Filter
                    selectorPayment.registerId = obj._id;
                    Payment.find(
                        selectorPayment
                    ).forEach(function (obj) {
                        paidAmount += obj.amount;
                    });

                    // Amount Deposit Until the end Date Filter
                    Deposit.find({
                        registerId: obj._id,
                        paidDate: {
                            $lte: toDate
                        }
                    }).forEach(function (obj) {
                        depositAmountTotal += obj.amount;
                    });
                    // Amount Deposit Before Date Filter
                    Deposit.find({
                        registerId: obj._id,
                        paidDate: {
                            $lt: fromDate
                        }
                    }).forEach(function (obj) {
                        depositAmountTotalBeforeDate += obj.amount;
                    });
                    // Amount Deposit at Date Filter
                    selectorDeposite.registerId = obj._id;
                    Deposit.find(
                        selectorDeposite
                    ).forEach(function (obj) {
                        depositAmount += obj.amount;
                    });


                    detailObj.paidAmount = paidAmount;
                    detailObj.deposit =
                        depositAmount;
                    detailObj.closedDate = obj.closedDate;
                    var totalAmountFinal = 0;
                    var totalAmountBeforeDate = 0;

                    var amountPay = detailObj.paidAmount + depositAmount;
                    var amountPayTotal = paidAmountTotal +
                        depositAmountTotal;

                    var amountPayBeforeDate = paidAmountTotalBeforeDate +
                        depositAmountTotalBeforeDate;

                    var amountPayAtTime = amountPayTotal - amountPay;
                    obj.items.forEach(function (ob) {
                        if (ob.doctor == doctorObj._id.doctorId) {
                            detailObj.invoiceShare = ob.amount;
                        }
                        //  Amount Share
                        if (ob.amount > amountPayAtTime) {
                            var amountRule = ob.amount - amountPayAtTime;
                        } else {
                            var amountRule = 0;
                            amountPayAtTime = amountPayAtTime - ob.amount;
                        }

                        if (amountPay < amountRule) {
                            totalAmountFinal = amountPay;
                            amountRule = amountRule - amountPay;
                            amountPay = amountPay - amountPay;
                        } else {
                            totalAmountFinal = amountRule;
                            amountPay = amountPay - amountRule;
                        }

                        // Amount Share Before Date


                        var amountRuleBeforDate = ob.amount;

                        if (amountPayBeforeDate < amountRuleBeforDate) {
                            totalAmountBeforeDate = amountPayBeforeDate;
                            amountRuleBeforDate = amountRuleBeforDate -
                                amountPayBeforeDate;
                            amountPayBeforeDate = amountPayBeforeDate -
                                amountPayBeforeDate;
                        } else {
                            totalAmountBeforeDate = amountRuleBeforDate;
                            amountPayBeforeDate = amountPayBeforeDate -
                                amountRuleBeforDate;
                        }

                        // Check With Doctor Id
                        if (ob.doctor == doctorObj._id.doctorId) {
                            detailObj.isHeader = false,
                                detailObj.isFooter = false,
                                detailObj.amount = totalAmountFinal;
                            detailObj.amountBeforeDate =
                                totalAmountBeforeDate;
                            totalAmount += totalAmountFinal;
                            grandTotal += totalAmountFinal;
                            laboExpenseTemp += detailObj.laboExpense;
                            totalAmountBeforeDateFinal +=
                                totalAmountBeforeDate;
                        }
                    });

                    content.push(detailObj);

                });
                content.push({
                    isFooter: true,
                    isHeader: false,
                    totalAmount: totalAmount,
                    totalAmountBeforeDateFinal: totalAmountBeforeDateFinal
                });
            });
            console.log(content);
            data.footer.grandTotalUsd = grandTotal;
            data.footer.grandTotalLaboUsd = laboExpenseTemp;

            if (content.length > 0) {
                data.content = content;
                return data;
            } else {
                data.content.push({
                    registerId: 'no results'
                });
                return data;
            }

        }
    }
});