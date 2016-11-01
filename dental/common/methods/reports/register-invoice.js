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
                        patientId: {$last: "$patientId"},
                        patientDoc: {$last: "$patientDoc"},
                        registerDate: {$last: "$registerDate"},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        subTotal: {$last: "$subTotal"},
                        subDiscount: {$last: "$subDiscount"},
                        total: {$last: "$total"},
                        items: {
                            $addToSet: {
                                itemId: "$items.itemId",
                                itemName: "$itemDoc.name",
                                qty: "$items.qty",
                                price: "$items.price",
                                discount: "$items.discount",
                                amount: "$items.amount"
                            }
                        }
                    }
                }
            ])[0];
            return {rptTitle, rptContent};
        }
    }
});
