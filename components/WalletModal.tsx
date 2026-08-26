'use client';

import React from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function WalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { openConnectModal } = useConnectModal();

  React.useEffect(() => {
    if (isOpen && openConnectModal) {
      openConnectModal();
      onClose();
    }
  }, [isOpen, openConnectModal, onClose]);

  return null;
}
