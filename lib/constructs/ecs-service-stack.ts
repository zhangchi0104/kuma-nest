import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

import { ServerProps } from '../types/ServerEnvironmentVariables';
import path from 'path';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { Duration } from 'aws-cdk-lib';

type EcsServiceStackProps = ServerProps & {
  vpc: ec2.IVpc;
  hostedZone: route53.IHostedZone;
};
type BlogServiceTaskDefinitionProps = {
  taskDefinitionName: string;
  containerName: string;
  containerImage: ecs.ContainerImage;
  env: ServerProps['env'];
};

interface EcsClusterProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.ISecurityGroup;
}
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
    const securityGroup = this.createSecurityGroup({ vpc });
    const ecsCluster = this.createCluster({ vpc, securityGroup });

    const service = new ecsp.ApplicationLoadBalancedEc2Service(
      this,
      'BlogService',
      {
        cluster: ecsCluster,
        // taskDefinition,
        certificate,
        memoryLimitMiB: 400,
        cpu: 256,
        desiredCount: 1,
        taskImageOptions: {
          image: conatinerImage,
          containerName: 'BlogServerContainer',
          containerPort: 3000,
          environment: { ...env },
        },
        serviceName: 'BlogService',
        domainName: 'prod.api.chiz.dev',
        domainZone: hostedZone,
        listenerPort: 443,
      },
    );

    service.targetGroup.configureHealthCheck({
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      timeout: Duration.seconds(10),
      interval: Duration.minutes(5),
      path: '/health',
    });
    this.ecsService = service;
  }

  private createTaskDefinition(props: BlogServiceTaskDefinitionProps) {
    const logging = new ecs.AwsLogDriver({ streamPrefix: 'blog-prod' });
    const taskDefinition = new ecs.TaskDefinition(
      this,
      'BlogBackendTaskDefinition',
      {
        family: props.taskDefinitionName,
        compatibility: ecs.Compatibility.EC2,
        cpu: '256',
        memoryMiB: '512',
        networkMode: ecs.NetworkMode.BRIDGE,
      },
    );
    taskDefinition.addContainer(props.containerName, {
      image: props.containerImage,
      containerName: props.containerName,
      portMappings: [
        {
          containerPort: this.containerPort,
          hostPort: this.hostPort,
          protocol: ecs.Protocol.TCP,
          name: 'nest-port',
        },
      ],

      environment: { ...props.env },
      logging: logging,
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:8000/hello'],
        startPeriod: Duration.minutes(5),
        interval: Duration.minutes(1),
        timeout: Duration.seconds(10),
        retries: 3,
      },
      startTimeout: Duration.minutes(2),
      cpu: 256,
      memoryLimitMiB: 400,
    });
    return taskDefinition;
  }

  private createCluster(props: EcsClusterProps) {
    const { vpc } = props;
    const ecsCluster = new ecs.Cluster(this, 'BlogCluster', {
      vpc,
    });
    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2023(),
      minCapacity: 1,
      maxCapacity: 1,
      securityGroup: props.securityGroup,
    });
    const capacityProvider = new ecs.AsgCapacityProvider(
      this,
      'CapacityProvider',
      {
        autoScalingGroup: asg,
      },
    );
    ecsCluster.addAsgCapacityProvider(capacityProvider);
    return ecsCluster;
  }
  private createSecurityGroup(props: { vpc: ec2.IVpc }) {
    const { vpc } = props;
    const securityGroup = new ec2.SecurityGroup(this, 'BlogSecurityGroup', {
      vpc,
    });
    // Allow any one to connect port 443
    // Allow anyone to connect port 8000
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere IPv4',
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv6(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere IPv4',
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8000),
      'Allow HTTPS traffic from anywhere IPv4',
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv6(),
      ec2.Port.tcp(8000),
      'Allow HTTPS traffic from anywhere IPv4',
    );
    return securityGroup;
  }

  private get containerPort() {
    return 8000;
  }

  private get hostPort() {
    return 8000;
  }
}
