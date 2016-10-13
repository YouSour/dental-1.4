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
                        from: "dental_laboratoryItems",
                        localField: "items.labo",
                        foreignField: "_id",
                        as: "laboDoc"
                    }
                },
                {
                    $unwind: "$laboDoc"
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
                        total: 1,
                        items: 1,
                        itemDoc: 1,
                        itemName: "$itemDoc.name",
                        laboDoc: 1,
                        laboName: "$laboDoc.name",
                        drDoc: 1,
                        doctorName: "$drDoc.name"
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
                                laboName:"$laboName",
                                laboAmount: "$items.laboAmount",
                                doctor: "$items.doctor",
                                doctorName:"$doctorName",
                                doctorAmount: "$items.doctorAmount"
                            }
                        }
                    }
                }
            ]);
            return data[0];
        }
    }
});