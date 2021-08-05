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
    event ArticlePosted(
        uint articleId,
        uint timePosted,
        address indexed authoraddress,
        address indexed publicationAddress
    );

    // Emitted when article is updated.
    event ArticleEdited(
        uint articleId,
        uint timeUpdated,
        address indexed authorAddress,
        address indexed publicationAddress
    );

    struct Article {
        address authorAddress;
        address publicationAddress;
        uint timePosted;
        uint timeUpdated;
    }

    // VARIABLES ---
    Article[] public articles;

    // Mapping of articleId to the author (address) of the article
    mapping(uint => address) articleIdToAuthor;
    // Mapping of articleId to IPFS hashes of the article.
    mapping(uint => bytes32[]) articleIdToHashes;
    // Mapping of author address to the ids of each article they have authored.
    mapping(address => uint[]) authorAddressToArticles;
    // Mapping of articleId to Publication's address
    mapping(uint => address) articleIdToPublication;

    // MODIFIERS ---
    modifier onlyAuthor(uint _articleId) {
        require(articleIdToAuthor[_articleId] == msg.sender, "You are not the author of this article.");
        _;
    }

    // PUBLIC FUNCTIONS ---
    /// @notice Posts a new article to IPFS
    /// @dev
    /// @param _articleHash IPFS hash of text written by the author
    /// @param _publicationAddress Address of the publication
    function postArticle(bytes32 _articleHash, address _publicationAddress) public {
        // TO-DO: Run modifier to check for valid hash

        Article memory newArticle = Article({
            authorAddress: msg.sender,
            publicationAddress: _publicationAddress,
            timePosted: block.timestamp,
            timeUpdated: 0
        });

        articles.push(newArticle);
        uint256 articleId = (articles.length).sub(1);

        _addArticleHash(articleId, _articleHash);
        authorAddressToArticles[msg.sender].push(articleId);
        articleIdToAuthor[articleId] = msg.sender;

        emit ArticlePosted(articleId, block.timestamp, msg.sender, _publicationAddress);
    }

    /// @notice Updates an article already uploaded to IPFS by adding new hash
    /// @dev Only the author may call this fn.
    /// @param _articleId The id of the article being updated
    /// @param _articleHash The hash of the new version of the article's text
    function updateArticle(uint _articleId, bytes32 _articleHash) public onlyAuthor(_articleId) {
        _addArticleHash(_articleId, _articleHash);
        emit ArticleEdited(_articleId, block.timestamp, msg.sender, articleIdToPublication[_articleId]);
    }

    // PRIVATE FUNCTIONS ---
    /// @notice Updates an article already uploaded to IPFS.
    /// @dev
    /// @param _articleId The id of the article
    /// @param _articleHash The hash of the article's text
    function _addArticleHash(uint _articleId, bytes32 _articleHash) private {
        articleIdToHashes[_articleId].push(_articleHash);
    }
}