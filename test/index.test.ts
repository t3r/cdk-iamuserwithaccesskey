// import { expect, countResources } from '@aws-cdk/assert';
import { Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as kms from 'aws-cdk-lib/aws-kms';
import { IamUserWithAccessKey } from '../src';


describe('User', () => {
  test('Template has the correct resources', () => {
    let stack: Stack;
    stack = new Stack();
    new IamUserWithAccessKey(stack, 'User', {
      // secretName: 'IamUserWithAccessKeySecret',
      userName: 'iamUserWithAccessKeyUsername',
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::IAM::User', 1);
    template.resourceCountIs('AWS::IAM::AccessKey', 1);
    template.resourceCountIs('AWS::SecretsManager::Secret', 1);
    expect(template).toMatchSnapshot();
    //TODO: Test that generateSecretString for the Secret is always null!
  });

  test('Secret uses custom KMS key when provided', () => {
    const stack = new Stack();
    const kmsKey = new kms.Key(stack, 'TestKey');

    new IamUserWithAccessKey(stack, 'UserWithKey', {
      userName: 'testUser',
      encryptionKey: kmsKey,
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::KMS::Key', 1);
    template.hasResourceProperties('AWS::SecretsManager::Secret', {
      KmsKeyId: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('TestKey.*'),
          'Arn',
        ],
      },
    });
  });
});
