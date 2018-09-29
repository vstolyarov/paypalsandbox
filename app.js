const express = require('express');
const ejs=require('ejs');
const paypal=require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', 
    'client_id': 'AcW9LuwF8r7GgBzcKz0uLfLLKnk7xa8sg00ctFlRUdO470OXlUba10jtMiC4l1R_TPQbvouGUKFTXtMZ',
    'client_secret': 'EJUDXJ5xAvyCW0tUAjY8LKBhnlxMJ6JTu45jx5QuWF1fjrOwy-xbFsqdADjrFs2qZ9Tj3Vadd4Rz2ELm'
});

const app=express();
app.set('view engine', 'ejs');

app.post('/pay', (req,res)=>{


    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Boston Hat",
                    "sku": "item",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Boston Hat. This is the payment description."
        }]
    };
    

    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i=0; i<payment.links.length;i++){
                if(payment.links[i].rel==='approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
           
        }
    });


});

app.get('/',(req,res)=>res.render('index'));

app.get('/success', (req,res)=>{
    const payerId=req.query.PayerID;
    const paymentId=req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            
            console.log(JSON.stringify(payment));
            res.send('Success');
        }

    });
});

app.get('/cancel', (req,res)=>res.send('canceled'))


app.listen(3000,()=>console.log('Server Started'));