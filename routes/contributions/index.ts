import  { FastifyInstance } from 'fastify';
import createContribution from './createContribution';
import getContributionsByConditions from './getContributionsByConditions';
import getContributionById from './getContributionById';

export default async function (fastify: FastifyInstance) {
  createContribution(fastify);
  getContributionsByConditions(fastify);
  getContributionById(fastify);
}