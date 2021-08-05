pragma solidity ^0.8.0;

import "../client/node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../client/node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

/// @title Main parent contract
/// @author Griffin Sharp & Riley Campbell
/// @notice TBD
/// @dev TBD
contract Editor is Ownable {
    // TO-DO: Remove any uint's not being used.
    // Opitmize uintXXX for smaller values wherever possible (uint256 -> uint16)
    using SafeMath for uint256;
    using SafeMath for uint32;
    using SafeMath for uint16;

    // EVENTS ---
    // Emitted when article is first created.
    event NewArticle(
        uint articleId,
        string authorName,
        string publicationName,
        string datePosted
    );

    // Emitted when article is updated.
    event ArticleEdited(
        uint articleId,
        string authorName,
        string publicationName,
        string dateUpdated
    );

    struct Article {
        address authorAddress;
        string authorName;
        string publicationName;
        uint256 timePosted;
        uint256 timeUpdated;
    }

    // VARIABLES ---
    Article[] public articles;

    // Mapping of articleId to the author (address) of the article
    mapping(uint => address) articleIdToAuthor;
    // Mapping of articleId to IPFS hashes of the article.
    // This is our version control mechanism. The article itself will not keep track of the text in state.
    mapping(uint => address[]) articleIdToHashes;
    // Mapping of author address to the ids of each article they have authored.
    mapping(address => uint[]) authorAddressToArticles;

    // MODIFIERS ---
    modifier onlyAuthor(uint _articleId) {
        require(articleIdToAuthor[_articleId] == msg.sender, "You are not the author of this article.");
        _;
    }

    // PUBLIC FUNCTIONS ---

    /// @notice Posts a new article to IPFS
    /// @dev IPFS Upload needs finishing***
    /// @param _articleText The text written by the author to be uploaded to IPFS
    /// @param _authorName The author of the article's name
    /// @param _publicationName The name of the article's publisher, blog, etc.
    /// @return N/A
    function postArticle(string memory _articleText, string memory _authorName, string memory _publicationName) public {
        // TO-DO: Run modifier to check for only accepted characters in _articleText
        Article memory newArticle = Article({
            authorAddress: msg.sender,
            authorName: _authorName,
            publicationName: _publicationName,
            timePosted: block.timestamp,
            timeUpdated: 0
        });

        // TO-DO: Upload articleText to IPFS.
        // Get confirmation and store in variable named "ipfsUploadSuccessful"
        // Store hash from IPFS in articleIdToHashes ---> articleIdToHashes[articleId].push(articleIpfsHash);

        if (ipfsUploadSuccessful) {
            articles.push(newArticle);

            // Sub one here bc an article's id should be it's position in the articles arr w/ base zero
            uint256 articleId = (articles.length).sub(1);

            articleIdToHashes[articleId].push(articleIpfsHash);
            authorAddressToArticles[msg.sender].push(articleId);
            articleIdToAuthor[articleId] = msg.sender;
        }


    }

    /// @notice Updates an article already uploaded to IPFS.
    /// @dev Whole fn needs writing***. Does NOT call postArticle, but will share IPFS upload logic.
    /// Once new version is uploaded ---> articleIdToHashes[_articleId].push(articleIpfsHash);
    /// @param _articleId The id of the article being updated
    /// @return N/A
    function updateArticle(uint _articleId) public onlyAuthor(_articleId) {

    }
}