use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod seismic_auction_house {
    use super::*;

    pub fn initialize_auction_house(
        ctx: Context<InitializeAuctionHouse>,
        bump: u8,
        fee_payer_bump: u8,
        treasury_bump: u8,
        seller_fee_basis_points: u16,
        requires_sign_off: bool,
        can_change_sale_price: bool,
    ) -> Result<()> {
        let auction_house = &mut ctx.accounts.auction_house;
        auction_house.authority = ctx.accounts.authority.key();
        auction_house.treasury_mint = ctx.accounts.treasury_mint.key();
        auction_house.auction_house_fee_account = ctx.accounts.auction_house_fee_account.key();
        auction_house.auction_house_treasury = ctx.accounts.auction_house_treasury.key();
        auction_house.fee_withdrawal_destination = ctx.accounts.fee_withdrawal_destination.key();
        auction_house.fee_payer_bump = fee_payer_bump;
        auction_house.treasury_bump = treasury_bump;
        auction_house.seller_fee_basis_points = seller_fee_basis_points;
        auction_house.requires_sign_off = requires_sign_off;
        auction_house.can_change_sale_price = can_change_sale_price;
        auction_house.bump = bump;

        msg!("Auction house initialized successfully");
        Ok(())
    }

    pub fn create_auction(
        ctx: Context<CreateAuction>,
        auction_bump: u8,
        token_size: u64,
        minimum_price: u64,
        end_time: i64,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        auction.authority = ctx.accounts.authority.key();
        auction.token_mint = ctx.accounts.token_mint.key();
        auction.token_account = ctx.accounts.token_account.key();
        auction.treasury_mint = ctx.accounts.treasury_mint.key();
        auction.token_size = token_size;
        auction.minimum_price = minimum_price;
        auction.end_time = end_time;
        auction.current_price = minimum_price;
        auction.highest_bidder = None;
        auction.status = AuctionStatus::Active as u8;
        auction.bump = auction_bump;

        msg!("Auction created successfully");
        Ok(())
    }

    pub fn place_bid(
        ctx: Context<PlaceBid>,
        bid_amount: u64,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        let bid = &mut ctx.accounts.bid;

        // Check if auction is still active
        require!(
            auction.status == AuctionStatus::Active as u8,
            AuctionHouseError::AuctionNotActive
        );

        // Check if auction has ended
        require!(
            Clock::get()?.unix_timestamp < auction.end_time,
            AuctionHouseError::AuctionEnded
        );

        // Check if bid is higher than current price
        require!(
            bid_amount > auction.current_price,
            AuctionHouseError::BidTooLow
        );

        // Transfer tokens from bidder to auction
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.bidder_token_account.to_account_info(),
                to: ctx.accounts.auction_token_account.to_account_info(),
                authority: ctx.accounts.bidder.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, bid_amount)?;

        // Update auction state
        auction.current_price = bid_amount;
        auction.highest_bidder = Some(ctx.accounts.bidder.key());

        // Create bid record
        bid.auction = auction.key();
        bid.bidder = ctx.accounts.bidder.key();
        bid.amount = bid_amount;
        bid.timestamp = Clock::get()?.unix_timestamp;

        msg!("Bid placed successfully");
        Ok(())
    }

    pub fn end_auction(ctx: Context<EndAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction;

        // Check if auction has ended
        require!(
            Clock::get()?.unix_timestamp >= auction.end_time,
            AuctionHouseError::AuctionNotEnded
        );

        // Check if auction is still active
        require!(
            auction.status == AuctionStatus::Active as u8,
            AuctionHouseError::AuctionNotActive
        );

        // Update auction status
        auction.status = AuctionStatus::Ended as u8;

        // Transfer NFT to highest bidder if there is one
        if let Some(highest_bidder) = auction.highest_bidder {
            let transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.auction_token_account.to_account_info(),
                    to: ctx.accounts.bidder_token_account.to_account_info(),
                    authority: ctx.accounts.auction_authority.to_account_info(),
                },
            );

            token::transfer(transfer_ctx, auction.token_size)?;
        }

        msg!("Auction ended successfully");
        Ok(())
    }

    pub fn cancel_auction(ctx: Context<CancelAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction;

        // Only auction authority can cancel
        require!(
            auction.authority == ctx.accounts.authority.key(),
            AuctionHouseError::Unauthorized
        );

        // Check if auction is still active
        require!(
            auction.status == AuctionStatus::Active as u8,
            AuctionHouseError::AuctionNotActive
        );

        // Update auction status
        auction.status = AuctionStatus::Cancelled as u8;

        // Return NFT to original owner
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.auction_token_account.to_account_info(),
                to: ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.auction_authority.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, auction.token_size)?;

        msg!("Auction cancelled successfully");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8, fee_payer_bump: u8, treasury_bump: u8)]
pub struct InitializeAuctionHouse<'info> {
    #[account(
        init,
        payer = authority,
        space = AuctionHouse::LEN,
        seeds = [b"auction_house", authority.key().as_ref()],
        bump
    )]
    pub auction_house: Account<'info, AuctionHouse>,
    pub treasury_mint: Account<'info, token::Mint>,
    #[account(
        init,
        payer = authority,
        token::mint = treasury_mint,
        token::authority = auction_house,
        seeds = [b"auction_house_fee_account", auction_house.key().as_ref()],
        bump = fee_payer_bump
    )]
    pub auction_house_fee_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = authority,
        token::mint = treasury_mint,
        token::authority = auction_house,
        seeds = [b"auction_house_treasury", auction_house.key().as_ref()],
        bump = treasury_bump
    )]
    pub auction_house_treasury: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub fee_withdrawal_destination: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(auction_bump: u8)]
pub struct CreateAuction<'info> {
    #[account(
        init,
        payer = authority,
        space = Auction::LEN,
        seeds = [b"auction", token_mint.key().as_ref(), authority.key().as_ref()],
        bump = auction_bump
    )]
    pub auction: Account<'info, Auction>,
    pub token_mint: Account<'info, token::Mint>,
    #[account(
        constraint = token_account.owner == authority.key(),
        constraint = token_account.mint == token_mint.key()
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub treasury_mint: Account<'info, token::Mint>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(
        init,
        payer = bidder,
        space = Bid::LEN,
        seeds = [b"bid", auction.key().as_ref(), bidder.key().as_ref()],
        bump
    )]
    pub bid: Account<'info, Bid>,
    #[account(
        constraint = bidder_token_account.owner == bidder.key(),
        constraint = bidder_token_account.mint == auction.treasury_mint
    )]
    pub bidder_token_account: Account<'info, TokenAccount>,
    #[account(
        constraint = auction_token_account.mint == auction.treasury_mint
    )]
    pub auction_token_account: Account<'info, TokenAccount>,
    pub bidder: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct EndAuction<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(
        constraint = auction_token_account.key() == auction.token_account
    )]
    pub auction_token_account: Account<'info, TokenAccount>,
    #[account(
        constraint = bidder_token_account.owner == auction.highest_bidder.unwrap(),
        constraint = bidder_token_account.mint == auction.token_mint
    )]
    pub bidder_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is the auction authority PDA
    pub auction_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelAuction<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(
        constraint = auction_token_account.key() == auction.token_account
    )]
    pub auction_token_account: Account<'info, TokenAccount>,
    #[account(
        constraint = owner_token_account.owner == auction.authority,
        constraint = owner_token_account.mint == auction.token_mint
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is the auction authority PDA
    pub auction_authority: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct AuctionHouse {
    pub authority: Pubkey,
    pub treasury_mint: Pubkey,
    pub auction_house_fee_account: Pubkey,
    pub auction_house_treasury: Pubkey,
    pub fee_withdrawal_destination: Pubkey,
    pub fee_payer_bump: u8,
    pub treasury_bump: u8,
    pub seller_fee_basis_points: u16,
    pub requires_sign_off: bool,
    pub can_change_sale_price: bool,
    pub bump: u8,
}

#[account]
pub struct Auction {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub token_account: Pubkey,
    pub treasury_mint: Pubkey,
    pub token_size: u64,
    pub minimum_price: u64,
    pub current_price: u64,
    pub end_time: i64,
    pub highest_bidder: Option<Pubkey>,
    pub status: u8,
    pub bump: u8,
}

#[account]
pub struct Bid {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AuctionStatus {
    Active,
    Ended,
    Cancelled,
}

impl AuctionHouse {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 32 + 1 + 1 + 2 + 1 + 1 + 1;
}

impl Auction {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 33 + 1 + 1;
}

impl Bid {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8;
}

#[error_code]
pub enum AuctionHouseError {
    #[msg("Auction is not active")]
    AuctionNotActive,
    #[msg("Auction has ended")]
    AuctionEnded,
    #[msg("Auction has not ended yet")]
    AuctionNotEnded,
    #[msg("Bid amount is too low")]
    BidTooLow,
    #[msg("Unauthorized")]
    Unauthorized,
} 