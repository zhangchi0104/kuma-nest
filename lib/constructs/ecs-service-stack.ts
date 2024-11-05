import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { ServerProps } from 'lib/types/ServerEnvironmentVariables';
import path from 'path';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
type EcsServiceStackProps = ServerProps & {
  vpc: ec2.IVpc;
  hostedZone: route53.IHostedZone;
};
export class EcsServiceStack extends Construct {
  public readonly ecsService: ecsp.ApplicationLoadBalancedEc2Service;
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    const { env, vpc, hostedZone } = props;
    super(scope, id);
    const dockerfilePath = ecs.ContainerImage.fromAsset(
      path.join(__dirname, '../../'),
      {
        platform: Platform.LINUX_AMD64,
      },
    );
    const ecsCluster = new ecs.Cluster(this, 'BlogCluster', {
      vpc: vpc,
      capacity: {
        minCapacity: 1,
        maxCapacity: 1,
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
        memoryLimitMiB: 1024,
        taskImageOptions: {
          image: dockerfilePath,
          containerPort: 8000,
          environment: { ...env },
        },
        domainZone: hostedZone,
        domainName: 'prod.api.chiz.dev',
        cluster: ecsCluster,
      },
    );

    new CfnOutput(this, 'LoadBalancerDNS', {
      key: 'LoadBalancerDNS',
      value: this.ecsService.loadBalancer.loadBalancerDnsName,
    });
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: 'prod',
      target: route53.RecordTarget.fromAlias(
        new route53Targets.LoadBalancerTarget(this.ecsService.loadBalancer),
      ),
    });
  }
}
