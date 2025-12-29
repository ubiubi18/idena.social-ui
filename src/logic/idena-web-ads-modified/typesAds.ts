export const AdRelevance = {
    Top: 'top',
    Normal: 'normal',
    Low: 'low',
};

export const AdStatus = {
    Draft: 'draft',
    Reviewing: 'reviewing',
    Approved: 'approved',
    Rejected: 'rejected',
    Published: 'published',
};

export const AdVotingOption = {
    Approve: 'Approve',
    Reject: 'Reject',
};

export const AdVotingOptionId = {
    [AdVotingOption.Approve]: 0,
    [AdVotingOption.Reject]: 1,
};

export const AdRotationStatus = {
    Showing: 'showing',
    PartiallyShowing: 'partiallyShowing',
    NotShowing: 'notShowing',
};

export const VotingStatus = {
    Pending: 'pending',
    Open: 'open',
    Voted: 'voted',
    Counting: 'counting',
    Archived: 'archive',
    Terminated: 'terminated',
    Deploying: 'deploying',
    Funding: 'funding',
    Starting: 'starting',
    Voting: 'voting',
    Finishing: 'finishing',
    Prolonging: 'prolonging',
    Terminating: 'terminating',
    Invalid: 'invalid',
    CanBeProlonged: 'canbeprolonged',
};
