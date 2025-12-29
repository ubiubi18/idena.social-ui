// @ts-nocheck

import { hexToObject } from '../utils';
import { AdVotingOption, AdVotingOptionId, VotingStatus } from './typesAds';

const isVercelProduction = true;

const findContractData = (batchData, key) => batchData.find(x => x.key === key);

export function fetchAdVoting(address, batchData) {
    try {
        const {value: state, error: stateError} = findContractData(
            batchData,
            'state'
        );
        const fact = findContractData(batchData, 'fact');
        const result = findContractData(batchData, 'result');

        if (Boolean(fact.error) || Boolean(result.error)) {
            throw new Error('Voting does not exist');
        }

        if (Boolean(stateError) && stateError !== 'data is nil')
            throw new Error(stateError);

        const status =
      stateError === 'data is nil'
          ? VotingStatus.Terminated
          : mapToVotingStatus(state);

        return {
            status,
            ...hexToObject(fact.value),
            result: result.value,
            isFetched: true,
        };
    } catch (e) {
        console.error(e, address);
    }
}

const mapToVotingStatus = status => {
    switch (status) {
    case 0:
        return VotingStatus.Pending;
    case 1:
        return VotingStatus.Open;
    case 2:
        return VotingStatus.Archived;
    default:
        return status;
    }
};

const buildAdReviewVotingOption = option => ({
    id: AdVotingOptionId[option],
    value: option,
});

export const adVotingDefaults = {
    title: 'Is this ad appropriate?',
    votingDuration: isVercelProduction ? 4320 : 10,
    publicVotingDuration: isVercelProduction ? 4320 : 10,
    winnerThreshold: 51,
    quorum: 1,
    committeeSize: isVercelProduction ? 300 : 5,
    ownerFee: 0,
    shouldStartImmediately: true,
    isFreeVoting: true,
    options: [
        buildAdReviewVotingOption(AdVotingOption.Approve),
        buildAdReviewVotingOption(AdVotingOption.Reject),
    ],
};

export const buildAdReviewVoting = ({title, adCid}) => ({
    ...adVotingDefaults,
    desc: title,
    adCid,
});

export async function fetchProfileAds(address) {
    try {
        const {profileHash} = await callRpc('dna_identity', address);

        return profileHash
            ? Profile.fromHex(await callRpc('ipfs_get', profileHash)).ads ?? []
            : [];
    } catch {
        console.error('Error fetching ads for identity', address);
        return [];
    }
}

export const isApprovedVoting = (voting, adCid) =>
    isFinalVoting(voting) &&
  isApprovedAd(voting) &&
  voting.title === adVotingDefaults.title &&
  adCid === voting.adCid;

export const isRejectedVoting = voting =>
    isFinalVoting(voting) && isRejectedAd(voting);

const isFinalVoting = voting =>
    [VotingStatus.Archived, VotingStatus.Terminated].includes(voting?.status);

const isApprovedAd = voting =>
    isValidAdOption(
        voting?.options?.find(option => option?.id === voting?.result),
        AdVotingOption.Approve
    );

const isRejectedAd = voting =>
    isValidAdOption(
        voting?.options?.find(option => option?.id === voting?.result),
        AdVotingOption.Reject
    );

export const isValidAdOption = (option, targetValue) =>
    option?.id === AdVotingOptionId[targetValue] && option?.value === targetValue;
