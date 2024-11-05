import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { CfnOutput, Stack } from 'aws-cdk-lib';
import { ServerProps } from 'lib/types/ServerEnvironmentVariables';
import path from 'path';
export class EcsServiceStack extends Stack {
  public readonly ecsService: ecsp.ApplicationLoadBalancedEc2Service;
  constructor(scope: Construct, id: string, props: ServerProps) {
    super(scope, id);
    const vpc = ec2.Vpc.fromLookup(this, 'MainVPC', {
      vpcId: process.env.VPC_ID || '',
    });
    const dockerfilePath = ecs.ContainerImage.fromAsset(
      path.join(__dirname, '../../'),
    );
    const ecsCluster = new ecs.Cluster(this, 'BlogCluster', {
      vpc: vpc,
      capacity: {
        minCapacity: 1,
        maxCapacity: 2,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO,
        ),
      },
    });
    this.ecsService = new ecsp.ApplicationLoadBalancedEc2Service(
      this,
      'BlogServerService',
      {
        taskImageOptions: {
          image: dockerfilePath,
          containerPort: 8000,
          environment: { ...props.env },
        },
        cluster: ecsCluster,
      },
    );

    new CfnOutput(this, 'LoadBalancerDNS', {
      key: 'LoadBalancerDNS',
      value: this.ecsService.loadBalancer.loadBalancerDnsName,
    });
    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'next.dev.api.chiz.dev',
    });
    new route53.ARecord(this, 'AliasRecord', {
      zone: zone,
      recordName: 'api',
      target: route53.RecordTarget.fromAlias(
        new route53Targets.LoadBalancerTarget(this.ecsService.loadBalancer),
      ),
    });
  }
}
