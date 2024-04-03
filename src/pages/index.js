import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { getBalance, payInvoice, createInvoice } from '@/lightning/lnd-webln';
import axios from 'axios';

function SendModal({ onClose }) {
  const [invoice, setInvoice] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const result = await payInvoice(invoice);

    if (result || !result?.message === "Error fetching data") {
      setPaymentMessage("Payment successful!");
      setInvoice('');
    } else {
      setPaymentMessage('Payment failed...');
    }
  };

  return (
    <div className={styles.modal}>
      <h2>Send Invoice</h2>
      <form onSubmit={handleSubmit} className={styles.buttonRow}>
        <label>Invoice:</label>
        <br />
        <input type="text" value={invoice} onChange={e => setInvoice(e.target.value)} />
        <br />
        <button className={`${styles.button} ${styles.darkorange}`} type="submit">Send</button>
        <button className={styles.button} onClick={onClose}>Close</button>
      </form>
      {paymentMessage && <p>{paymentMessage}</p>}
    </div>
  );
}

function ReceiveModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [invoice, setInvoice] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const paymentRequest = await createInvoice(amount);
    if (paymentRequest) {
      setInvoice(paymentRequest);
      setMessage('Invoice created successfully.');
    } else {
      setMessage('Error creating invoice.');
    }
  };

  return (
    <div className={styles.modal}>
      <h2>Receive Amount</h2>
      <form onSubmit={handleSubmit} className={styles.buttonRow}>
        <label>Amount:</label>
        <br />
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <br />
        <button className={`${styles.button} ${styles.orange}`} type="submit">Create</button>
        <button className={`${styles.button} ${styles.purple}`} onClick={onClose}>Close</button>
      </form>
      {invoice ? (
        <>
          <p>{message}</p>
          <QRCode value={invoice} size={256} level="H" />
          <br />
          <span>Invoice:</span>
          <br />
          <span>{invoice}</span>
        </>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

function Appz() {
  const getPrice = () => {
    axios
      .get("https://api.coinbase.com/v2/prices/BTC-USD/spot")
      .then((res) => {
        const formattedPrice = Number(res.data.data.amount).toFixed(4);
        setPrice(formattedPrice);
        updateChartData(formattedPrice);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getPrice();
  }, []);

  return null;
}

export default function Home() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [balance, setBalance] = useState(null);
  const [price, setPrice] = useState(null);
  const [fiatBalance, setFiatBalance] = useState(null);

  const fetchBalance = async () => {
    const balanceResult = await getBalance();
    if (balanceResult) {
      console.log('Balance fetched successfully', balanceResult);
      setBalance(balanceResult?.balance);
    } else {
      console.error('Failed to fetch balance');
    }
  };

  const getPrice = async () => {
    axios
      .get("https://api.coinbase.com/v2/prices/BTC-USD/spot")
      .then((res) => {
        const formattedPrice = Number(res.data.data.amount).toFixed(4);
        setPrice(formattedPrice);
        updateChartData(formattedPrice);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getFiatBalance = async () => {
    if (balance && price) {
      const fiatBalance = (balance / 100000000) * price;
      setFiatBalance(fiatBalance.toFixed(2)); // Round to 2 decimal places
    }
  };

  useEffect(() => {
    if (!balance) fetchBalance();
    getPrice();
    getFiatBalance();
  }, );

  return (
    <>
      <Head>
        <title>Arcade Wallet</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h3>Price: $ <span className={styles.value}>{price}</span></h3>
        <h3>Balance: <span className={styles.value}>{balance}</span> sats</h3>
        <h3>Fiat Balance: $ <span className={styles.value}>{fiatBalance}</span></h3>
        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={() => setShowSendModal(true)}>Send</button>
          <button className={`${styles.button} ${styles.green}`} onClick={() => setShowReceiveModal(true)}>Receive</button>
        </div>
        {showSendModal && <SendModal onClose={() => setShowSendModal(false)} styles={styles} />}
        {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} styles={styles} />}
        <Appz setPrice={setPrice} />
      </main>
    </>
  )
}
