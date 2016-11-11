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
                {
                    $lookup: {
                        from: "dental_patient",
                        localField: "patientId",
                        foreignField: "_id",
                        as: "patientDoc"
                    }
                },
                {$unwind: {path: '$patientDoc', preserveNullAndEmptyArrays: true}},
                {
                    $project: {
                        _id: 1,
                        items: 1,
                        patientDoc: 1,
                        ageStatus: {
                            $cond: {
                                if: {$lte: ["$patientDoc.age", 13]},
                                then: 'Children (1 - 13)',
                                else: {
                                    $cond: {
                                        if: {$and: [{$lte: ["$patientDoc.age", 30]}, {$gte: ["$patientDoc.age", 14]}]},
                                        then: 'Adult (14 - 30)',
                                        else: "Old (31 - 80)"
                                    }
                                }
                            }
                        },
                        genderMale: {
                            $cond: [
                                {$eq: ["$patientDoc.gender", "M"]}, 1, 0
                            ]
                        },
                        genderFemale: {
                            $cond: [
                                {$eq: ["$patientDoc.gender", "F"]}, 1, 0
                            ]
                        }
                    }
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
                {
                    $group: {
                        _id: "$items.itemId",
                        disease: {$last: "$itemDoc.name"},
                        data: {
                            $addToSet: {
                                patientId: "$patientDoc._id",
                                ageStatus: "$ageStatus",
                                male: "$genderMale",
                                female: "$genderFemale"
                            }
                        }
                    }
                },
                {$unwind: {path: '$data', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: {
                            ageStatus: "$data.ageStatus",
                            _id: "$_id"
                        },
                        disease: {$last: "$disease"},
                        male: {
                            $sum: '$data.male'
                        },
                        female: {
                            $sum: "$data.female"
                        }
                    }
                },
                {
                    $group: {
                        _id: "$_id._id",
                        disease: {$last: "$disease"},
                        data: {
                            $addToSet: {
                                patientId: "$patientDoc._id",
                                ageStatus: "$_id.ageStatus",
                                male: "$male",
                                female: "$female"
                            }
                        }
                    }
                },
                {
                    $project:
                    {
                        _id: 1,
                        disease: 1,
                        data: 1,
                        totalMale: { $sum: "$data.male" },
                        totalFemale: { $sum: "$data.female" },

                    }
                },
                {
                    $project: {
                        _id: 1,
                        disease: 1,
                        data: 1,
                        totalMale: 1,
                        totalFemale: 1,
                        totalPeople: { $add: ["$totalMale", "$totalFemale"] }
                    }
                },
                {
                    $group: {
                        _id: 0,
                        data: {
                            $addToSet: "$$ROOT"
                        },

                    },
                },

            ])[0];

            return {rptTitle, rptHeader, rptContent};
        }
    }
});
