import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
// import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
// import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { ServerProps } from 'lib/types/ServerEnvironmentVariables';
import path from 'path';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ApplicationLoadBalancedEc2Service } from 'aws-cdk-lib/aws-ecs-patterns';
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
    // const ecsCluster = new ecs.Cluster(this, 'BlogCluster', {
    //   vpc,
    // });

    // const taskDefinition = new ecs.Ec2TaskDefinition(this, 'BlogTask');
    // taskDefinition.addContainer('BlogContainer', {
    //   containerName: 'BlogContainer',
    //   image: conatinerImage,
    //   memoryLimitMiB: 400,
    //   environment: { ...env },
    //   portMappings: [
    //     { containerPort: 8000, hostPort: 8000, protocol: ecs.Protocol.TCP },
    //   ],
    // });

    // const service = new ecs.Ec2Service(this, 'BlogService', {
    //   cluster: ecsCluster,
    //   taskDefinition,
    // });
    // const loadBalancer = new elbv2.ApplicationLoadBalancer(
    //   this,
    //   'LoadBalancer',
    //   {
    //     vpc,
    //     internetFacing: true,
    //   },
    // );
    // const listener = loadBalancer.addListener('Listener', {
    //   port: 80,
    // });
    // listener.addTargets('ECS', {
    //   port: 8000,
    //   targets: [
    //     service.loadBalancerTarget({
    //       containerName: 'BlogContainer',
    //       containerPort: 8000,
    //     }),
    //   ],
    // });
    // new route53.ARecord(this, 'AliasRecord', {
    //   zone: hostedZone,
    //   target: route53.RecordTarget.fromAlias(
    //     new route53Targets.LoadBalancerTarget(loadBalancer),
    //   ),
    // });
    const cluster = new ecs.Cluster(this, 'BlogCluster', {
      vpc,
    });
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'BlogASG', {
      vpc,
      minCapacity: 1,
      maxCapacity: 1,
      instanceType: new ec2.InstanceType('t3.micro'),
    });
    autoScalingGroup.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
    });
    const capacityProvider = new ecs.AsgCapacityProvider(
      this,
      'BlogCapacityProvider',
      {
        autoScalingGroup,
      },
    );
    cluster.addAsgCapacityProvider(capacityProvider);

    const service = new ApplicationLoadBalancedEc2Service(this, 'BlogService', {
      taskImageOptions: {
        image: conatinerImage,
        containerPort: 8000,
        environment: { ...env },
      },
      vpc,
      domainName: 'prod.api.chiz.dev',
      domainZone: hostedZone,
      memoryLimitMiB: 512,
      // certificate,
    });
    this.ecsService = service;
    new CfnOutput(this, 'LoadBalancerDNS', {
      value: service.loadBalancer.loadBalancerDnsName,
    });
  }
}
