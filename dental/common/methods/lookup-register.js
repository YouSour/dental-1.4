import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Register} from '../collections/register';

export const lookupRegister = new ValidatedMethod({
    name: 'dental.lookupRegister',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        registerId: {type: String}
    }).validator(),
    run({registerId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);

            let data = Register.aggregate([
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
                    $unwind: "$depositDoc"
                },
                {
                    $group: {
                        _id: '$_id',
                        items: {$last: '$items'},
                        registerDate: {$last: "$registerDate"},
                        total: {$last: "$total"},
                        patientId: {$last: "$patientId"},
                        branchId: {$last: "$branchId"},
                        totalDeposit: {$sum: '$depositDoc.amount'},
                        des: {$last: "$des"}
                    }
                },
                {$unwind: {path: '$items', preserveNullAndEmptyArrays: true}},
                {
                    $project: {
                        _id: 1,
                        totalDeposit: 1,
                        items: 1,
                        registerDate: 1,
                        patientId: 1,
                        total: 1,
                        branchId: 1,
                        des: 1
                    }
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
                    $lookup: {
                        from: "dental_diseaseItems",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "itemDoc"
                    }
                },
                {
                    $lookup: {
                        from: "dental_laboratoryItems",
                        localField: "items.labo",
                        foreignField: "_id",
                        as: "laboDoc"
                    }
                },
                {
                    $lookup: {
                        from: "dental_doctor",
                        localField: "items.doctor",
                        foreignField: "_id",
                        as: "drDoc"
                    }
                },
                {
                    $unwind: "$patientDoc"
                },
                {
                    $unwind: "$itemDoc"
                },
                {
                    $unwind: "$laboDoc"
                },
                {
                    $unwind: "$drDoc"
                },
                {
                    $project: {
                        _id: 1,
                        registerDate: 1,
                        patientId: 1,
                        patientDoc: 1,
                        des: 1,
                        branchId: 1,
                        totalDeposit: 1,
                        // subTotal: 1,
                        // subDiscount: 1,
                        total: 1,
                        items: 1,
                        itemDoc: 1,
                        itemName: "$itemDoc.name",
                        laboDoc: 1,
                        laboName: "$laboDoc.name",
                        drDoc: 1,
                        doctorName: "$drDoc.name",
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        registerDate: {$last: "$registerDate"},
                        patientId: {$last: "$patientId"},
                        patientDoc: {$last: "$patientDoc"},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        // subTotal: { $last: "$subTotal" },
                        totalDeposit: {$last: "$totalDeposit"},
                        // subDiscount: { $last: "$subDiscount" },
                        total: {$last: "$total"},
                        items: {
                            $addToSet: {
                                _id: "$items.itemId",
                                itemId: "$items.itemId",
                                itemName: "$itemName",
                                date: "$items.date",
                                qty: "$items.qty",
                                price: "$items.price",
                                amount: "$items.amount",
                                discount: "$items.discount",
                                labo: "$items.labo",
                                laboName: "$laboName",
                                laboAmount: "$items.laboAmount",
                                doctor: "$items.doctor",
                                doctorName: "$doctorName",
                                doctorAmount: "$items.doctorAmount"
                            }
                        }
                    }
                }
            ]);
            console.log(data[0]);
            return data[0];
        }
    }
});