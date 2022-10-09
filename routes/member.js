const express = require("express");
const router = express.Router();
const initModels = require("../models/init-models");
const sequelise = require("../config/db");
const models = initModels(sequelise);
const {Sequelize} = require("sequelize");
const statuses = require("../utils/statuses");

/**
 * @swagger
 * components:
 *  schemas:
 *    RegisteredMembers:
 *      type: object
 *      required:
 *        - companyname
 *        - walletaddress
 *        - membertype
 *        - projectid
 *        - taxid
 *        - email
 *      properties:
 *        companyname:
 *          type: string
 *        walletaddress:
 *          type: string
 *        membertype:
 *          type: string
 *        projectid:
 *          type: string
 *        taxid:
 *          type: string
 *        email:
 *          type: string
 *      example:
 *        companyname: Example
 *        walletaddress: 0xF4E0A3eDfc31f5F36989646645B2fCcfC8ECf3CC
 *        membertype: seller
 *        projectid: 1234
 *        taxid: 134
 *        email: test@example.com
 */

/**
 * @swagger
 * tags:
 *  - name: Seller
 *    description: Seller Routes
 *  - name: Regulator
 *    description: Regulator routes
 */

/**
 * @swagger
 * /seller/register:
 *  post:
 *    summary: Returns a member ID
 *    tags: [Seller]
 *    parameters:
 *    - in: body
 *      name: companyname
 *      schema:
 *          type: string
 *          example: Company1
 *          required: true
 *          description: company name
 *    - in: body
 *      name: walletaddress
 *      schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The member id
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  memberid:
 *                      type: number
 *                      description: membership id
 *                      example: 1
 *      400:
 *         description: An error happened whilst querying the database
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Error message
 *                    example: An error occurred
 *      500:
 *        description: An internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: object
 *                  description: Error object
 *                message:
 *                  type: string
 *                  description: Error message
 *                  example: Internal server error
 */

router.post("/register", (req, res) => {
    const data = {
        companyname: req.body.companyname,
        walletaddress: req.body.walletaddress,
        membertype: req.body.membertype,
        ...(req.body.membertype === 'seller' && {projectid: req.body.projectid}),
        ...(req.body.membertype === 'buyer' && {taxid: req.body.taxid}),
        email: req.body.email
    };

    models.RegisteredMembers.create(data)
        .then((data) => {
            // console.log(data.dataValues.pk);
            res
                .status(200)
                .json({message: "success", memberid: data.dataValues.pk});
        })
        .catch((err) => {
            res.status(400).json({message: err});
        });
});

router.post("/requestcredit", async (req, res) => {
    const hasPending = await models.CreditRequests.findOne({
        where: {
            memberid: req.body.memberid,
            status: statuses.PENDING
        }
    })
    console.log(hasPending)

    if (hasPending){
        res.status(400).send('You already have a pending request')
    } else {
        const data = {
            memberid: req.body.memberid,
            date: req.body.date,
            status: statuses.PENDING,
        };

        models.CreditRequests.create(data)
            .then((_) => {
                res.status(200).json({message: "success"});
            })
            .catch((err) => {
                res.status(400).json({message: "error", error: err});
            });
    }
});

router.post("/myrequests", (req, res) => {
    models.CreditRequests.findAll({
        where: {
            memberid: req.body.memberid
        },
        include: [{model: models.RegisteredMembers}],
    })
        .then((rows) => {
            let result = [];
            rows.forEach((r) => {
                result.push({
                    code: r.pk,
                    memberid: r.memberid,
                    companyname: r.registeredmember.companyname,
                    wallet: r.registeredmember.walletaddress,
                    projectid: r.registeredmember.projectid,
                    amount: r.amount,
                    status: r.status,
                    date: r.date
                });
            });
            res.status(200).json(result);
        })
        .catch((err) => {
            res.status(400).json({message: "error", error: err});
        });
});

router.post("/registrationdata", async (req, res) => {
    try {
        const member = await models.RegisteredMembers.findOne({
            where: {walletaddress: req.body.walletaddress},
        });
        console.log(member)
        res.send({
            membertype: member.membertype,
            projectid: member.projectid,
            taxid: member.taxid
        });
    } catch (e) {
        console.log(e)
        res.status(400).send({error: e, message: "Unexpected error occurred 😤"});
    }
});

router.post("/delete", async (req, res) => {
    try {
        await models.CreditRequests.destroy(
            {
                where: {
                    memberid: req.body.memberid,
                    pk: req.body.code
                },
            }
        );
        res.status(200).json({message: "Deleted"});
    } catch (e) {
        console.log(e.message)
        res.status(400).json({message: " "})
    }
});

module.exports = router;
