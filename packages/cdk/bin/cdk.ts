#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { AssociationsGameStack } from "../lib/stacks/AssociationsGameStack"

const app = new cdk.App()

new AssociationsGameStack(app, "AssociationsGame")
