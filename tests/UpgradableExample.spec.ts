import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import {
    UpgradableExampleV1,
    UpgradableExampleV2,
    UpgradableExampleV3,
    UpgradeContract,
} from '../wrappers/UpgradableExample_UpgradableExample';
import '@ton-community/test-utils';

describe('UpgradableExample', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let v1: SandboxContract<UpgradableExampleV1>;
    let v2: SandboxContract<UpgradableExampleV2>;
    let v3: SandboxContract<UpgradableExampleV3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        v1 = blockchain.openContract(await UpgradableExampleV1.fromInit(deployer.address));
        v2 = blockchain.openContract(UpgradableExampleV2.fromAddress(v1.address));
        v3 = blockchain.openContract(UpgradableExampleV3.fromAddress(v1.address));

        // blockchain.verbosity = {
        //     print: true,
        //     blockchainLogs: true,
        //     vmLogs: 'vm_logs_full',
        //     debugLogs: true,
        // }

        const deployResult = await v1.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: v1.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and nFTCollection are ready to use
    });

    // it('v1: should increment counter', async () => {
    //     await v1.send(deployer.getSender(), { value: toNano('1') }, 'Increment');
    //     const counter = await v1.getCounter();
    //     expect(counter).toEqual(1n);
    // })
    //
    // it('v1: should upgrade to v2 with "Double" message receiver', async () => {
    //     const newContract = await UpgradableExampleV2.fromInit(deployer.address)
    //     const upgradeContract: UpgradeContract = {
    //         $$type: 'UpgradeContract',
    //         code: newContract.init!.code,
    //         data: null,
    //     }
    //     const upgradeResult = await v1.send(deployer.getSender(), { value: toNano('1') }, upgradeContract)
    //     expect(upgradeResult.transactions).toHaveTransaction({
    //         from: deployer.address,
    //         to: v1.address,
    //         success: true,
    //     })
    //
    //     await v2.send(deployer.getSender(), { value: toNano('1') }, 'Increment');
    //     let counterBefore = await v2.getCounter();
    //
    //     const doubleResult = await v2.send(deployer.getSender(), { value: toNano('1') }, 'Double')
    //     expect(doubleResult.transactions).toHaveTransaction({
    //         from: deployer.address,
    //         to: v1.address,
    //         success: true,
    //     })
    //
    //     const counterAfter = await v2.getCounter();
    //     expect(counterAfter).toEqual(counterBefore * 2n);
    // });

    it('v2: should upgrade to v3 with "getVersion" getter', async () => {
        // 1. Increment counter 0 -> 1
        await v2.send(deployer.getSender(), { value: toNano('1') }, 'Increment')

        // Should be 1
        console.log("----> counter before upgrade", await v2.getCounter());

        // 2. Upgrading contract
        const newContract = await UpgradableExampleV3.fromInit(deployer.address)
        const upgradeContract: UpgradeContract = {
            $$type: 'UpgradeContract',
            code: newContract.init!.code,
            data: newContract.init!.data,
        }
        const result = await v2.send(deployer.getSender(), { value: toNano('1') }, upgradeContract)
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: v1.address,
            success: true,
        })

        // 3. Checking counter after upgrade. Should be 1, but overwritten to 0
        console.log("----> counter after upgrade", await v2.getCounter());

        // await v2.send(deployer.getSender(), { value: toNano('1') }, 'Increment')
        // const version = await v3.getVersion();
        // console.log(version)
        // expect(version).toEqual(3n);
    });
});
