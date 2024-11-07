import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
// import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
// import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
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
  public readonly ecsService:
    | ecs.BaseService
    | ecsp.ApplicationLoadBalancedEc2Service;
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    const { env, vpc, hostedZone } = props;
    super(scope, id);
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'DomainCertificate',
      process.env.CERTIFICATE_ARN || '',
    );
    const conatinerImage = ecs.ContainerImage.fromAsset(
      path.join(__dirname, '../../'),
      {
        platform: Platform.LINUX_AMD64,
      },
    );
    const ecsCluster = new ecs.Cluster(this, 'BlogCluster', {
      vpc,
    });
    const asg = ecsCluster.addCapacity('BlogCapacity', {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      minCapacity: 1,
      maxCapacity: 1,
    });
    asg.scaleOnCpuUtilization('BlogScaling', {
      targetUtilizationPercent: 70,
    });

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'BlogTask');
    taskDefinition.addContainer('BlogContainer', {
      containerName: 'BlogContainer',
      image: conatinerImage,
      memoryLimitMiB: 400,
      environment: { ...env },
      portMappings: [
        { containerPort: 8000, hostPort: 8000, protocol: ecs.Protocol.TCP },
      ],
    });

    // const service = new ecs.Ec2Service(this, 'BlogService', {
    //   cluster: ecsCluster,
    //   taskDefinition,
    // });
    const service = new ecsp.ApplicationLoadBalancedEc2Service(
      this,
      'BlogService',
      {
        cluster: ecsCluster,
        taskDefinition,
        publicLoadBalancer: true,
        domainZone: hostedZone,
        domainName: 'blog',
        // certificate,
      },
    );
    this.ecsService = service;
    new CfnOutput(this, 'LoadBalancerDNS', {
      value: service.loadBalancer.loadBalancerDnsName,
    });
  }
}
