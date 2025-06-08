import { useState, useEffect } from 'react';
import { useTonConnect } from './use-ton-connect';
import { useStore } from '../store';

export const usePurchaseFlow = (onComplete?: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(false);
  const { connected, connect, sendTransaction, tonConnectUI } = useTonConnect();
  const { clearCart } = useStore();

  const sendTransactionAndComplete = async () => {
    if (!tonConnectUI || !connected) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: "UQBmcMcpmoG8bDsenKkmolD1gOl1SSlMNf7QF6CYSWMhG4No",
            amount: "100000000"
          }
        ]
      });
      
      clearCart();
      setPurchaseSuccess(true);
      setPendingPurchase(false);
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsProcessing(false);
      setPendingPurchase(false);
    }
  };

  const handlePurchase = async () => {
    if (!tonConnectUI) {
      console.error('TON Connect UI not initialized');
      return;
    }

    try {
      if (!connected) {
        setIsProcessing(true);
        setPendingPurchase(true);
        await connect();
        return;
      }
      await sendTransactionAndComplete();
    } catch (error) {
      console.error('Purchase failed:', error);
      setIsProcessing(false);
      setPendingPurchase(false);
    }
  };

  useEffect(() => {
    if (connected && pendingPurchase && tonConnectUI) {
      sendTransactionAndComplete();
    }
  }, [connected, pendingPurchase, tonConnectUI]);

  const closePurchaseSuccess = () => {
    setPurchaseSuccess(false);
    onComplete?.();
  };

  return {
    isProcessing,
    purchaseSuccess,
    pendingPurchase,
    connected,
    handlePurchase,
    sendTransactionAndComplete,
    closePurchaseSuccess,
    tonConnectUI
  };
};