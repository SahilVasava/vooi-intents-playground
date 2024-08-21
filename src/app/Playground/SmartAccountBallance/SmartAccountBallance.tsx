"use client";

import { useReadCab } from "@build-with-yi/wagmi";
import { erc20Abi, formatEther, parseAbi, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import {
  testErc20Address,
  testErc20VaultAddress,
  vaultManagerAddress,
} from "~/config";
import { vaultManager } from "./abi/vaultManager";

interface Props {}

export function SmartAccountBallance({}: Props): JSX.Element {
  const { address } = useAccount();
  const { data: balance } = useReadCab();

  const { writeContracts, data: id } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
    },
  });

  return (
    <div>
      <div>CAB: {balance !== undefined ? formatEther(balance) : "-"}</div>
      <button
        className="bg-yellow-400 disabled:opacity-60"
        disabled={callsStatus?.status === "PENDING"}
        onClick={() => {
          const amount = parseEther("0.3");

          writeContracts({
            contracts: [
              {
                address: testErc20Address,
                abi: parseAbi(["function mint(address,uint256)"]),
                functionName: "mint",
                args: [address, amount],
              },
              {
                address: testErc20Address,
                abi: erc20Abi,
                functionName: "approve",
                args: [vaultManagerAddress, amount],
              },
              {
                address: vaultManagerAddress,
                abi: vaultManager,
                functionName: "deposit",
                args: [testErc20Address, testErc20VaultAddress, amount, false],
              },
            ],
            capabilities: {
              paymasterService: {
                url: "https://rpc.zerodev.app/api/v2/paymaster/587a5a94-89bd-435f-a637-8c0f4efef2d9",
              },
            },
          });
        }}
      >
        Mint
      </button>
    </div>
  );
}