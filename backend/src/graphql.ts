import { ObjectType, Field, ID, Int, Float, registerEnumType } from 'type-graphql';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { PrismaClient } from '@prisma/client';

// Enums
export enum ChainType {
  SEI = 'SEI',
  SOLANA = 'SOLANA'
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum AuctionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED'
}

registerEnumType(ChainType, {
  name: 'ChainType',
  description: 'Supported blockchain networks'
});

registerEnumType(ListingStatus, {
  name: 'ListingStatus',
  description: 'Status of a listing'
});

registerEnumType(AuctionStatus, {
  name: 'AuctionStatus',
  description: 'Status of an auction'
});

// Types
@ObjectType()
export class Collection {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  symbol: string;

  @Field()
  description: string;

  @Field()
  imageUrl: string;

  @Field()
  bannerUrl: string;

  @Field()
  contractAddress: string;

  @Field(() => ChainType)
  chain: ChainType;

  @Field(() => Int)
  totalSupply: number;

  @Field(() => Float)
  floorPrice: number;

  @Field(() => Float)
  totalVolume: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Listing {
  @Field(() => ID)
  id: string;

  @Field()
  tokenId: string;

  @Field()
  contractAddress: string;

  @Field()
  seller: string;

  @Field(() => Float)
  price: number;

  @Field()
  paymentToken: string;

  @Field(() => ListingStatus)
  status: ListingStatus;

  @Field()
  tokenURI: string;

  @Field()
  metadata: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Bid {
  @Field(() => ID)
  id: string;

  @Field()
  listingId: string;

  @Field()
  bidder: string;

  @Field(() => Float)
  amount: number;

  @Field()
  paymentToken: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class Auction {
  @Field(() => ID)
  id: string;

  @Field()
  tokenId: string;

  @Field()
  contractAddress: string;

  @Field()
  seller: string;

  @Field(() => Float)
  startingPrice: number;

  @Field(() => Float)
  currentPrice: number;

  @Field()
  paymentToken: string;

  @Field(() => AuctionStatus)
  status: AuctionStatus;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => [Bid])
  bids: Bid[];

  @Field()
  createdAt: Date;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  address: string;

  @Field()
  username: string;

  @Field()
  avatarUrl: string;

  @Field(() => [Listing])
  listings: Listing[];

  @Field(() => [Bid])
  bids: Bid[];

  @Field()
  createdAt: Date;
}

// Input Types
@ObjectType()
export class CreateListingInput {
  @Field()
  tokenId: string;

  @Field()
  contractAddress: string;

  @Field(() => Float)
  price: number;

  @Field()
  paymentToken: string;

  @Field()
  tokenURI: string;

  @Field()
  metadata: string;
}

@ObjectType()
export class CreateBidInput {
  @Field()
  listingId: string;

  @Field(() => Float)
  amount: number;

  @Field()
  paymentToken: string;
}

@ObjectType()
export class CreateAuctionInput {
  @Field()
  tokenId: string;

  @Field()
  contractAddress: string;

  @Field(() => Float)
  startingPrice: number;

  @Field()
  paymentToken: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;
}

// Context type
export interface Context {
  user?: User;
  prisma: PrismaClient;
}

// Resolvers
@Resolver()
export class CollectionResolver {
  @Query(() => [Collection])
  async collections(): Promise<Collection[]> {
    // Implementation would query the database
    return [];
  }

  @Query(() => Collection, { nullable: true })
  async collection(@Arg('id') id: string): Promise<Collection | null> {
    // Implementation would query the database
    return null;
  }
}

@Resolver()
export class ListingResolver {
  @Query(() => [Listing])
  async listings(): Promise<Listing[]> {
    // Implementation would query the database
    return [];
  }

  @Query(() => Listing, { nullable: true })
  async listing(@Arg('id') id: string): Promise<Listing | null> {
    // Implementation would query the database
    return null;
  }

  @Mutation(() => Listing)
  @UseMiddleware(authMiddleware)
  async createListing(
    @Arg('input') input: CreateListingInput,
    @Ctx() ctx: Context
  ): Promise<Listing> {
    // Implementation would create a listing
    return {} as Listing;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(authMiddleware)
  async cancelListing(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    // Implementation would cancel a listing
    return true;
  }
}

@Resolver()
export class BidResolver {
  @Query(() => [Bid])
  async bids(@Arg('listingId') listingId: string): Promise<Bid[]> {
    // Implementation would query the database
    return [];
  }

  @Mutation(() => Bid)
  @UseMiddleware(authMiddleware)
  async createBid(
    @Arg('input') input: CreateBidInput,
    @Ctx() ctx: Context
  ): Promise<Bid> {
    // Implementation would create a bid
    return {} as Bid;
  }
}

@Resolver()
export class AuctionResolver {
  @Query(() => [Auction])
  async auctions(): Promise<Auction[]> {
    // Implementation would query the database
    return [];
  }

  @Query(() => Auction, { nullable: true })
  async auction(@Arg('id') id: string): Promise<Auction | null> {
    // Implementation would query the database
    return null;
  }

  @Mutation(() => Auction)
  @UseMiddleware(authMiddleware)
  async createAuction(
    @Arg('input') input: CreateAuctionInput,
    @Ctx() ctx: Context
  ): Promise<Auction> {
    // Implementation would create an auction
    return {} as Auction;
  }
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async user(@Arg('address') address: string): Promise<User | null> {
    // Implementation would query the database
    return null;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: Context): Promise<User | null> {
    return ctx.user || null;
  }
}

// Auth middleware placeholder
function authMiddleware({ context }: { context: Context }) {
  // Implementation would verify authentication
  return true;
} 