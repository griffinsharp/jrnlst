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

    event publicationCreated(
        uint publicationId,
        uint timeCreated,
        address indexed publicationAddress
    );

    struct Article {
        string articleName;
        address authorAddress;
        address publicationAddress;
        uint timePosted;
        uint timeUpdated;
    }

    // VARIABLES ---
    Article[] public articles;
    address[] public publications;

    // Mapping of articleId to IPFS hashes of the article.
    mapping(uint => bytes[]) articleIdToHashes;
    // Mapping of author address to the ids of each article they have authored.
    mapping(address => uint[]) authorAddressToArticleIds;

    // Mapping of publicationId to article ids.
    mapping(uint => uint[]) publicationIdToArticleIds;
    // Mapping of publicationId to approved authors.
    mapping(address => address[]) publicationAddressToAuthors;

    // MODIFIERS ---

    // Checks to see if the caller is the author of the article.
    modifier onlyAuthorOfArticle(uint _articleId) {
        bool isAuthor = false;
        uint[] memory authoredArticles = authorAddressToArticleIds[msg.sender];

        for(uint i=0; i < authoredArticles.length; i++) {
            if (authoredArticles[i] == _articleId) {
                isAuthor = true;
            }
        }

        require(isAuthor, "You are not the author of this article.");
        _;
    }

    // Checks to see if the author has NOT created an article yet/still default value.
    modifier isNotAnAuthor() {
        require(authorAddressToArticleIds[msg.sender].length == 0, "You have already authored an article. Sign in with another ETH account to create a publisher account.");
        _;
    }

    // Address provided is not a publication.
    modifier isNotAPublisher(address _address) {
        bool isNotPublisher = true;

        for (uint i=0; i < publications.length; i++) {
            if (_address == publications[i]) {
                isNotPublisher = false;
            }
        }

        require(isNotPublisher, "Account already registered as a publisher.");
        _;
    }

    // Checks to see if the publicationId provided is registered or the 0x0 address (self-published).
    modifier publicationValid(address _publicationAddress) {
        bool isPublication = false;

        if (_publicationAddress == address(0)) {
            isPublication = true;
        } else {
            for (uint i=0; i < publications.length; i++) {
                if (_publicationAddress == publications[i]) {
                    isPublication = true;
                }
            }
        }

        require(isPublication, "ETH address is not a registered publication. Create one or have a publisher add you to the team.");
        _;
    }

    // Checks if user calling the function is on the publication's approved author list
    modifier isMemberOfPublication(address _publicationAddress) {
        bool isMember = false;

        if (_publicationAddress == address(0)) {
            isMember = true;
        } else {
            address[] memory approvedAuthors = publicationAddressToAuthors[_publicationAddress];
            if (approvedAuthors.length > 0) {
                for (uint i=0; i < approvedAuthors.length; i++) {
                    if (approvedAuthors[i] == msg.sender) {
                        isMember = true;
                    }
                }
            }
        }

        require(isMember, "You not a member of the publication. Check for address errors. Ask publication owner to add your address as an author.");
        _;
    }

    // TO-DO:
    // Validates IPFS hash
    modifier isValidHash(bytes memory _ipfsHash) {
        require(true, "Invalid IPFS hash provided.");
        _;
    }

    // PUBLIC FUNCTIONS ---
    /// @notice Adds an author to a publication's approved authors. Can only be called by a publication.
    /// @dev We only check if its a publication, not a specific publication, since we use msg.sender to add to the authors array. Only adds non-publishers.
    /// @param _authorAddress The address of the author to be added.
    function addAuthorToPublication(address _authorAddress) public publicationValid(msg.sender) isNotAPublisher(_authorAddress) {
        publicationAddressToAuthors[msg.sender].push(_authorAddress);
    }

    /// @notice Creates a publisher account.
    /** @dev Checks for if a user is already reigstered as a publisher AND if they haven't authored an article yet.
    Checks authorAddressToArticleIds and loops though publishers. There is no createAuthor or authors array to save authors gas. */
    function createPublication() public isNotAPublisher(msg.sender) isNotAnAuthor {
        publications.push(msg.sender);
        uint id = publications.length.sub(1);
        emit publicationCreated({
            publicationId: id,
            timeCreated: block.timestamp,
            publicationAddress: msg.sender
        });
    }

    /// @notice Posts a new article to IPFS
    /// @dev Checks if user is a member of the publication. UI should tell user to use 0x0 address if self-published or to create their own publisher account.
    /// @param _articleHash IPFS hash of text written by the author
    /// @param _publicationAddress Address of the publication
    function postArticle(
        bytes memory _articleHash,
        string memory _articleName,
        address _publicationAddress
    )
        public
        isNotAPublisher(msg.sender)
        isMemberOfPublication(_publicationAddress)
        isValidHash(_articleHash)
        publicationValid(_publicationAddress)
    {
        // TO-DO: Run modifier to check for valid hash

        Article memory newArticle = Article({
            articleName: _articleName,
            authorAddress: msg.sender,
            publicationAddress: _publicationAddress,
            timePosted: block.timestamp,
            timeUpdated: 0
        });

        articles.push(newArticle);
        uint256 articleId = (articles.length).sub(1);

        _addArticleHash(articleId, _articleHash);
        authorAddressToArticleIds[msg.sender].push(articleId);

        emit ArticlePosted(articleId, block.timestamp, msg.sender, _publicationAddress);
    }

    /// @notice Removes author from a publication's approved authors. Can only be called by publication.
    /** @dev Use the return value (bool) to display on the UI a success or failure message. Remove return val if not necessary.
    Delete inserts the default value back, so it will be 0x0. May have to filter this out on the FE. */
    /// @param _authorAddress The address of the author to be removed.
    /// @return Returns true is successfully removed. False is not removed.
    function removeAuthorFromPublication(address _authorAddress) public publicationValid(msg.sender) returns(bool) {
        address[] storage authorsArray = publicationAddressToAuthors[msg.sender];
        for (uint i=0; i < authorsArray.length; i++) {
            if (authorsArray[i] == _authorAddress) {
                delete authorsArray[i];
                return true;
            }
        }

        return false;
    }

    /// @notice Updates an article already uploaded to IPFS by adding new hash
    /** @dev Only the author may call this fn. Right now, isMemberOfPublication only runs on creation (not on update).
    Debating adding it here to prevent rogue ex-official authors from sabotage editing, but I also want authors to have full autonomy over their work. */
    /// @param _articleId The id of the article being updated
    /// @param _articleHash The hash of the new version of the article's text
    function updateArticle(uint _articleId, bytes memory _articleHash) public onlyAuthorOfArticle(_articleId) isValidHash(_articleHash) {
        _addArticleHash(_articleId, _articleHash);
        emit ArticleEdited(_articleId, block.timestamp, msg.sender, articles[_articleId].publicationAddress);
    }

    /// @notice View function that checks if the current user is a publisher account.
    /// @dev Used via UI ONLY. Use modifiers for function checks.
    /// @return True if publisher account. False is not.
    function isRegisteredPublisher() public view returns(bool) {
        for (uint i=0; i < publications.length; i++) {
            if (msg.sender == publications[i]) {
                return true;
            }
        }

        return false;
    }

    // PRIVATE FUNCTIONS ---
    /// @notice Updates an article already uploaded to IPFS.
    /// @dev
    /// @param _articleId The id of the article
    /// @param _articleHash The hash of the article's text
    function _addArticleHash(uint _articleId, bytes memory _articleHash) private {
        articleIdToHashes[_articleId].push(_articleHash);
    }
}