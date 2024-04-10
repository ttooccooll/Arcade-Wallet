import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { getBalance, payInvoice, createInvoice, logOut } from '@/lightning/lnd-webln';
import axios from 'axios';

const playMP3 = () => {
  const audio = new Audio("/kings.mp3");
  audio.play();
};

const playMP4 = () => {
  const audio = new Audio("/kingm.mp3");
  audio.play();
};

const playMP5 = () => {
  const audio = new Audio("/coinreturn.mp3");
  audio.play();
};

function SendModal({ onClose }) {
  const [invoice, setInvoice] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const result = await payInvoice(invoice);

    if (result || !result?.message === "Error fetching data") {
      alert("Payment successful!");
      setInvoice('');
    } else {
      alert('Payment failed...');
    }
  };

  return (
    <div className={styles.modal}>
      <form onSubmit={handleSubmit} className={styles.buttonRow}>
        <div className={styles.machinez}>
          <h2>Send Invoice</h2>
          <label>Invoice:&nbsp;</label>
          <input type="text" value={invoice} onChange={e => setInvoice(e.target.value)} />
        </div>
        <div className={styles.machine}>
          <button className={`${styles.button} ${styles.darkorange}`} type="submit">Send</button>
          <button className={styles.button} onClick={() => { onClose(); playMP3(); console.log('Play button clicked'); }}>Close</button>
        </div>
      </form>
      {paymentMessage && <p>{paymentMessage}</p>}
    </div>
  );
}

function ReceiveModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [invoice, setInvoice] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const paymentRequest = await createInvoice(amount);
    if (paymentRequest) {
      setInvoice(paymentRequest);
      alert('Invoice created successfully.');
      setSubmitted(true);
    } else {
      alert('Error creating invoice.');
    }
  };

  return (
    <div className={styles.modal}>
      {!submitted ? (
      <form onSubmit={handleSubmit} className={styles.buttonRow}>
        <div className={styles.machinez}>
          <h2>Receive Amount</h2>
          <label>Amount:&nbsp;</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div className={styles.machine}>
          <button className={`${styles.button} ${styles.orange}`} type="submit">Create</button>
          <button className={`${styles.button} ${styles.purple}`} onClick={() => { onClose(); playMP3(); console.log('Play button clicked'); }}>Close</button>
        </div>
      </form>
      ) : (
        <>
          <div className={styles.invoice}>
          <p>{message}</p>
            <QRCode value={invoice} size={200} level="H" />
            <br />
            <br />
            <span>{invoice}</span>
          </div>
          <button className={`${styles.button} ${styles.purple}`} onClick={() => { onClose(); playMP3(); console.log('Play button clicked'); }}>Close</button>
        </>
      )}
    </div>
  );
}

function FAQModal({ onClose }) {
  return (
    <div className={styles.modalz}>
      <div className={styles.row}>
        <h2>FAQ</h2>
        <p>Q: What is this? <br /><br /> A: It&apos;s a way to use your browser extension wallet but still feel like you&apos;re in the arcade of a pizza joint in 1989.</p>
        <p>Q: Is this trustworthy? <br /><br /> A: I woudldn&apos;t use it for anything important.</p>
        <p>Q: Can I send you all of my sats? <br /><br /> A: I will happily take your sats. Send them to @jasonb on stacker.news. We can also just talk and what-not. My npub is there.</p>
        <br />
        <button className={`${styles.button} ${styles.purple}`} onClick={() => { onClose(); playMP3(); console.log('Play button clicked'); }}>Close</button>
      </div>
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
  const [showFAQModal, setShowFAQModal] = useState(false);
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
      setBalance(0); 
    }
  };

  const getPrice = async () => {
    axios
      .get("https://api.coinbase.com/v2/prices/BTC-USD/spot")
      .then((res) => {
        const formattedPrice = Number(res.data.data.amount).toFixed(2);
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
      <h1>Super Bitcoin Wallet</h1>
      <main className={styles.main}>
        <h3>Price: $ <span className={styles.value}>{price}</span></h3>
        <h3>Balance: <span className={styles.value}>{balance}</span> sats</h3>
        <h3>Fiat Balance: $ <span className={styles.value}>{fiatBalance}</span></h3>
        <div className={styles.buttonRowG}>
          <button className={styles.button} onClick={() => { setShowSendModal(true); playMP4(); }}>Send</button>
          <button className={`${styles.button} ${styles.green}`} onClick={() => { setShowReceiveModal(true); playMP4(); }}>Receive</button>
        </div>
        {showSendModal && <SendModal onClose={() => setShowSendModal(false)} styles={styles} />}
        {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} styles={styles} />}
        <Appz setPrice={setPrice} />
      </main>
      <div className={styles.coinreturn} >
          <div className={styles.slotf}></div>
          <button className={styles.FAQ} onClick={() => { setShowFAQModal(true); playMP5(); }} >------<br />FAQ<br />------</button>
          <div className={styles.slot}></div>
          <button className={styles.logout} onClick={() => { logOut(); playMP5(); }} >-------------<br />LOGOUT<br />-------------</button>
      </div>
      {showFAQModal && <FAQModal onClose={() => setShowFAQModal(false)} styles={styles} />}
    </>
  )
}
