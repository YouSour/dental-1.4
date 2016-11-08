import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company';
import {Branch} from '../../../../core/common/collections/branch';
import {Register} from '../../collections/register';
// import {DiseaseItems} from '../../collections/disease-items';

export const analysisPatientReport = new ValidatedMethod({
    name: 'dental.analysisPatientReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(2000);

            let rptTitle, rptHeader, rptContent, rptFooter;

            let fDate = moment(params.repDate[0]).toDate();
            let tDate = moment(params.repDate[1]).toDate();

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Header ---
            // Branch
            let branchDoc = Branch.find({_id: {$in: params.branchId}});
            params.branchHeader = _.map(branchDoc.fetch(), function (val) {
                return `${val._id} : ${val.enName}`;
            });


            rptHeader = params;

            // --- Content ---
            let selector = {};
            selector.branchId = {$in: params.branchId};
            selector.registerDate = {$gte: fDate, $lte: tDate};

            rptContent = Register.aggregate([
                {
                    $match: selector,
                },
                {$unwind: {path: '$items', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: "dental_diseaseItems",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "itemDoc"
                    }
                },
                {$group: {_id: "$items.itemId", disease: {$last: "$itemDoc.name"}, number: {$sum: '$items.qty'},}},
                {
                    $group: {
                        _id: 0,
                        total: {
                            $sum: '$number'
                        },
                        data: {
                            $addToSet: "$$ROOT"
                        },

                    },
                }
            ])[0];
            console.log(rptContent);

            return {rptTitle, rptHeader, rptContent};
        }
    }
});
